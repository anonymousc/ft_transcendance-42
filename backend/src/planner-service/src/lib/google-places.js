const redis = require('./redis');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const PLACES_DETAIL_URL = 'https://places.googleapis.com/v1/places';

const SEARCH_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.types',
  'places.primaryTypeDisplayName',
  'places.formattedAddress',
  'places.editorialSummary',
  'places.photos',
  'places.regularOpeningHours',
  'places.priceLevel',
].join(',');

const DETAIL_FIELD_MASK = [
  'id',
  'displayName',
  'location',
  'rating',
  'userRatingCount',
  'types',
  'primaryTypeDisplayName',
  'formattedAddress',
  'editorialSummary',
  'photos',
  'regularOpeningHours',
  'priceLevel',
  'nationalPhoneNumber',
  'websiteUri',
].join(',');

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
    console.warn('[google-places] cache write failed:', err.message);
  }
}

function buildPhotoUrl(_photoName) {
  // Photo URLs are not included in planner responses — the raw API key must
  // never be embedded in data returned to clients or persisted in the DB.
  return null;
}

function humanizeType(type) {
  if (!type) return 'Place';
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function mapGooglePlace(raw) {
  const photoUrl = buildPhotoUrl(raw.photos?.[0]?.name);
  const category = raw.primaryTypeDisplayName?.text || humanizeType(raw.types?.[0]);

  return {
    place_id: raw.id ?? null,
    name: raw.displayName?.text ?? 'Unknown',
    category,
    rating: raw.rating ?? null,
    userRatingCount: raw.userRatingCount ?? null,
    description: raw.editorialSummary?.text ?? `A ${category.toLowerCase()} worth visiting.`,
    address: raw.formattedAddress ?? '',
    lat: raw.location?.latitude ?? null,
    lng: raw.location?.longitude ?? null,
    photos: photoUrl ? [photoUrl] : [],
    image: photoUrl,
    priceLevel: raw.priceLevel ?? null,
    openingHours: raw.regularOpeningHours?.weekdayDescriptions ?? null,
    types: raw.types ?? [],
  };
}

async function callTextSearch(textQuery, maxResultCount = 15) {
  const cacheKey = `planner:search::${textQuery.toLowerCase()}::${maxResultCount}`;
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(PLACES_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': SEARCH_FIELD_MASK,
    },
    body: JSON.stringify({ textQuery, maxResultCount }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`Google Places API error ${res.status}: ${errText}`);
    err.code = res.status === 503 ? 'PLACES_UNAVAILABLE' : 'PLACES_ERROR';
    err.status = 502;
    throw err;
  }

  const json = await res.json();
  const places = (json.places ?? []).map(mapGooglePlace);
  await setCache(cacheKey, places);
  return places;
}

async function getPlaceDetails(placeId) {
  if (!placeId) return null;

  const cacheKey = `planner:detail::${placeId}`;
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${PLACES_DETAIL_URL}/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': DETAIL_FIELD_MASK,
    },
  });

  if (!res.ok) {
    console.warn(`[google-places] Failed to fetch details for ${placeId}: ${res.status}`);
    return null;
  }

  const raw = await res.json();
  const place = mapGooglePlace(raw);
  await setCache(cacheKey, place);
  return place;
}

module.exports = { callTextSearch, getPlaceDetails, buildPhotoUrl, mapGooglePlace };
