const { Router } = require('express');

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

const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
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
    rating: raw.rating ?? null,
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

// GET /places/photos — server-side proxy; mounted publicly in server.js (img tags cannot send auth cookies cross-origin)
async function photoProxyHandler(req, res) {
  const { ref } = req.query;

  if (!ref || typeof ref !== 'string' || !PHOTO_REF_RE.test(ref)) {
    return res.status(400).end();
  }

  try {
    const googleUrl =
      `https://places.googleapis.com/v1/${ref}/media?maxHeightPx=800&key=${GOOGLE_PLACES_API_KEY}`;
    const upstream = await fetch(googleUrl);

    if (!upstream.ok) return res.status(404).end();

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const buffer = await upstream.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('[places/photos]', err.message);
    return res.status(502).end();
  }
}

router.get('/places', async (req, res) => {
  const validationError = validateCity(req.query.city);
  if (validationError) return fail(res, 400, 'INVALID_INPUT', validationError);

  const city = req.query.city.trim();
  const cacheKey = `city::${city.toLowerCase()}`;

  const cached = getCached(cacheKey);
  if (cached) return ok(res, cached, { cached: true });

  try {
    const rawPlaces = await callGoogleTextSearch(`places to visit in ${city}`, 10);
    const places = rawPlaces.map((raw, i) => mapGooglePlace(raw, i, null));
    setCache(cacheKey, places);
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
  const cacheKey = `search::${q.toLowerCase()}`;

  const cached = getCached(cacheKey);
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
    setCache(cacheKey, stored);
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
  cache,
  CACHE_TTL_MS,
};
