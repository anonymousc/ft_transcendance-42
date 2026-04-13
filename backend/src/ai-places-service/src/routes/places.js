const { Router } = require('express');
const redis = require('../lib/redis');

const router = Router();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.location',
  'places.rating',
  'places.types',
  'places.primaryTypeDisplayName',
  'places.formattedAddress',
  'places.editorialSummary',
  'places.photos',
].join(',');

// Regex that matches the photo name format Google returns:
// places/<place_id>/photos/<photo_id>
const PHOTO_REF_RE = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;

function ok(res, data, extra = {}) {
  return res.json({ ok: true, data, ...extra });
}

function fail(res, status, code, message) {
  const body = { ok: false, error: { code, message } };
  return res.status(status).json(body);
}

const CITY_MIN = 2;
const CITY_MAX = 100;
const CITY_RE = /^[\p{L}\p{M}\s'\-,.]+$/u;

function validateCity(raw) {
  if (!raw || typeof raw !== 'string') return 'city query parameter is required';
  const city = raw.trim();
  if (city.length < CITY_MIN) return `city must be at least ${CITY_MIN} characters`;
  if (city.length > CITY_MAX) return `city must be at most ${CITY_MAX} characters`;
  if (!CITY_RE.test(city)) return 'city contains invalid characters';
  return null;
}

function validateQuery(raw) {
  if (!raw || typeof raw !== 'string') return 'q parameter is required';
  const q = raw.trim();
  if (q.length < 3) return 'q must be at least 3 characters';
  if (q.length > 500) return 'q must be at most 500 characters';
  return null;
}

const CACHE_TTL_S = 60 * 60;

async function getCached(key) {
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function setCache(key, data) {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', CACHE_TTL_S);
  } catch (err) {
    console.warn('[ai-places] cache write failed:', err.message);
  }
}

async function callGoogleTextSearch(textQuery, maxResultCount = 10) {
  const res = await fetch(PLACES_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({ textQuery, maxResultCount }),
  });

  if (!res.ok) {
    const upstreamErr = new Error(`Google Places API error ${res.status}`);
    upstreamErr.code = res.status === 503 ? 'PLACES_UNAVAILABLE' : 'PLACES_ERROR';
    upstreamErr.status = 502;
    throw upstreamErr;
  }

  const json = await res.json();
  return json.places ?? [];
}

// Return a server-proxied URL so the raw API key is never sent to clients
function buildPhotoUrl(photoName) {
  if (!photoName) return null;
  return `/places/photos?ref=${encodeURIComponent(photoName)}`;
}

function humanizeType(type) {
  if (!type) return 'Place';
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function buildMatchReason(raw, preferences) {
  const types = (raw.types ?? []).map(t => t.toLowerCase().replace(/_/g, ' '));
  const primaryType = (raw.primaryTypeDisplayName?.text ?? '').toLowerCase();

  if (preferences && preferences.length > 0) {
    for (const pref of preferences) {
      const p = pref.toLowerCase();
      if (
        types.some(t => t.includes(p) || p.includes(t)) ||
        primaryType.includes(p) ||
        p.includes(primaryType)
      ) {
        return `Matches your interest in ${pref}.`;
      }
    }
  }

  const summary = raw.editorialSummary?.text;
  if (summary) {
    const firstSentence = summary.split(/[.!?]/)[0].trim();
    return firstSentence ? `${firstSentence}.` : summary;
  }

  const category = raw.primaryTypeDisplayName?.text || humanizeType(raw.types?.[0]);
  return `A notable ${category.toLowerCase()} worth visiting.`;
}

function mapGooglePlace(raw, index, preferences) {
  const photoUrl = buildPhotoUrl(raw.photos?.[0]?.name);
  const category = raw.primaryTypeDisplayName?.text || humanizeType(raw.types?.[0]);

  return {
    place_id: raw.id ?? null,
    name: raw.displayName?.text ?? 'Unknown',
    category,
    rating: raw.rating ?? 0,
    description: raw.editorialSummary?.text ?? `A ${category} worth visiting.`,
    address: raw.formattedAddress ?? '',
    must_visit: index < 3,
    lat: raw.location?.latitude ?? null,
    lng: raw.location?.longitude ?? null,
    photos: photoUrl ? [photoUrl] : [],
    image: photoUrl,
    match_reason: buildMatchReason(raw, preferences),
  };
}

const PLACES_DETAIL_URL = 'https://places.googleapis.com/v1/places';

// Google Place IDs (v1 `places.id`) are typically alphanumeric; keep validation loose.
function validatePlaceIdQuery(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let id = raw.trim();
  if (id.startsWith('places/')) id = id.slice('places/'.length);
  if (id.length < 4 || id.length > 512 || /[\s#?]/.test(id)) return null;
  return id;
}

/** Prefer the highest-resolution photo (typical “hero” / well-known shots); fallback to first valid ref. */
function pickBestPhotoRef(photos) {
  if (!Array.isArray(photos) || photos.length === 0) return null;
  let bestName = null;
  let bestArea = -1;
  for (const p of photos) {
    const name = p?.name;
    if (!name || typeof name !== 'string' || !PHOTO_REF_RE.test(name)) continue;
    const w = Number(p.widthPx) || 0;
    const h = Number(p.heightPx) || 0;
    const area = w * h;
    if (area > bestArea) {
      bestArea = area;
      bestName = name;
    }
  }
  if (bestName) return bestName;
  for (const p of photos) {
    const name = p?.name;
    if (name && typeof name === 'string' && PHOTO_REF_RE.test(name)) return name;
  }
  return null;
}

async function resolvePhotoRefFromPlaceId(placeId) {
  const cacheKey = `ai-places:place-hero-ref::${placeId}`;
  const cached = await getCached(cacheKey);
  if (cached && typeof cached.ref === 'string' && PHOTO_REF_RE.test(cached.ref)) {
    return cached.ref;
  }

  const res = await fetch(`${PLACES_DETAIL_URL}/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'photos',
    },
  });

  if (!res.ok) return null;

  const json = await res.json();
  const name = pickBestPhotoRef(json.photos);
  if (!name) return null;

  await setCache(cacheKey, { ref: name });
  return name;
}

async function streamGooglePlacePhoto(photoRef, res) {
  const googleUrl =
    `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=1200&key=${GOOGLE_PLACES_API_KEY}`;
  const upstream = await fetch(googleUrl);

  if (!upstream.ok) return res.status(404).end();

  const contentType = upstream.headers.get('content-type') || 'image/jpeg';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400');

  const buffer = await upstream.arrayBuffer();
  return res.send(Buffer.from(buffer));
}

// GET /places/photos — server-side proxy; mounted publicly in server.js (img tags cannot send auth cookies cross-origin)
// Query: ref=places/<place_id>/photos/<photo_id> OR placeId=<Google Place ID> (hero photo: largest width×height from details)
async function photoProxyHandler(req, res) {
  const { ref, placeId: placeIdRaw } = req.query;

  try {
    let photoRef = null;

    if (ref && typeof ref === 'string' && PHOTO_REF_RE.test(ref)) {
      photoRef = ref;
    } else {
      const placeId = validatePlaceIdQuery(placeIdRaw);
      if (!placeId) return res.status(400).end();
      photoRef = await resolvePhotoRefFromPlaceId(placeId);
      if (!photoRef) return res.status(404).end();
    }

    return await streamGooglePlacePhoto(photoRef, res);
  } catch (err) {
    console.error('[places/photos]', err.message);
    return res.status(502).end();
  }
}

router.get('/places', async (req, res) => {
  const validationError = validateCity(req.query.city);
  if (validationError) return fail(res, 400, 'INVALID_INPUT', validationError);

  const city = req.query.city.trim();
  const cacheKey = `ai-places:city::${city.toLowerCase()}`;

  const cached = await getCached(cacheKey);
  if (cached) return ok(res, cached, { cached: true });

  try {
    const rawPlaces = await callGoogleTextSearch(`places to visit in ${city}`, 10);
    const places = rawPlaces.map((raw, i) => mapGooglePlace(raw, i, null));
    await setCache(cacheKey, places);
    return ok(res, places, { cached: false });
  } catch (err) {
    console.error('[ai-places/places]', err.message);
    return fail(res, err.status ?? 500, err.code ?? 'INTERNAL_ERROR', 'Failed to fetch places');
  }
});

router.get('/places/search', async (req, res) => {
  const validationError = validateQuery(req.query.q);
  if (validationError) return fail(res, 400, 'INVALID_INPUT', validationError);

  const q = req.query.q.trim();
  const cacheKey = `ai-places:search::${q.toLowerCase()}`;

  const cached = await getCached(cacheKey);
  if (cached) {
    return ok(res, cached.places, { cached: true, city: cached.city, intent: cached.intent });
  }

  try {
    const rawPlaces = await callGoogleTextSearch(q, 10);
    const places = rawPlaces.map((raw, i) => mapGooglePlace(raw, i, null));

    const firstAddress = rawPlaces[0]?.formattedAddress ?? '';
    const parts = firstAddress.split(',').map(s => s.trim()).filter(Boolean);
    const city = parts.length >= 2 ? parts[parts.length - 2] : parts[0] ?? '';

    const stored = { city, intent: q, places };
    await setCache(cacheKey, stored);
    return ok(res, places, { cached: false, city, intent: q });
  } catch (err) {
    console.error('[ai-places/search]', err.message);
    return fail(res, err.status ?? 500, err.code ?? 'INTERNAL_ERROR', 'Failed to search places');
  }
});

module.exports = {
  router,
  photoProxyHandler,
  callGoogleTextSearch,
  buildPhotoUrl,
  buildMatchReason,
  mapGooglePlace,
};
