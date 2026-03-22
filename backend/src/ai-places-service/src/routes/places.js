const { Router } = require('express');

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

// ── Error envelope helpers ─────────────────────────────────────────────────
function ok(res, data, extra = {}) {
  return res.json({ ok: true, data, ...extra });
}

function fail(res, status, code, message, details) {
  const body = { ok: false, error: { code, message } };
  if (details !== undefined) body.error.details = details;
  return res.status(status).json(body);
}

// ── Validation ─────────────────────────────────────────────────────────────
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

// ── In-memory cache (shared across both routes) ────────────────────────────
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

async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  if (res.status === 429) {
    const body = await res.json();
    const retryStr = body?.error?.details?.find(d => d.retryDelay)?.retryDelay ?? '20s';
    const retryMs = (parseFloat(retryStr) + 1) * 1000;
    console.log(`[ai-places] Rate limited — retrying in ${retryStr}…`);
    await new Promise(r => setTimeout(r, retryMs));
    return callGemini(prompt);
  }

  if (!res.ok) {
    const err = await res.text();
    const upstreamErr = new Error(`Gemini API error ${res.status}: ${err}`);
    upstreamErr.code = res.status === 503 ? 'GEMINI_UNAVAILABLE' : 'GEMINI_ERROR';
    upstreamErr.status = 502;
    throw upstreamErr;
  }

  return res.json();
}

function parseGeminiText(json) {
  const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const err = new Error('Gemini returned non-JSON response');
    err.code = 'GEMINI_PARSE_ERROR';
    err.status = 502;
    throw err;
  }
  return parsed;
}

async function fetchUnsplashImage(query) {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.results?.[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

async function enrichWithImages(places) {
  return Promise.all(
    places.map(async place => {
      const image = await fetchUnsplashImage(place.image_query || place.name);
      return { ...place, image };
    }),
  );
}

async function fetchPlacesFromGemini(city) {
  const prompt = `List 10 must-visit places in ${city}. Respond ONLY with a valid JSON array, no markdown, no extra text. Each object must have:
- name: string
- category: string (e.g. "Museum", "Park", "Restaurant")
- rating: number (1.0 - 5.0)
- description: string (2 sentences, why it's worth visiting)
- address: string
- must_visit: boolean (true for top 3 highlights)
- image_query: string (3-5 words in English for image search, e.g. "Jemaa el-Fna square Marrakech")
- lat: number (latitude, e.g. 31.6258)
- lng: number (longitude, e.g. -7.9892)`;

  const json = await callGemini(prompt);
  const parsed = parseGeminiText(json);

  if (!Array.isArray(parsed)) {
    const err = new Error('Gemini response was not a JSON array');
    err.code = 'GEMINI_PARSE_ERROR';
    err.status = 502;
    throw err;
  }
  return parsed;
}

router.get('/places', async (req, res) => {
  const validationError = validateCity(req.query.city);
  if (validationError) return fail(res, 400, 'INVALID_INPUT', validationError);

  const city = req.query.city.trim();
  const cacheKey = `city::${city.toLowerCase()}`;

  const cached = getCached(cacheKey);
  if (cached) return ok(res, cached, { cached: true });

  try {
    const places = await fetchPlacesFromGemini(city);
    const enriched = await enrichWithImages(places);
    setCache(cacheKey, enriched);
    return ok(res, enriched, { cached: false });
  } catch (err) {
    console.error('[ai-places/places]', err.message);
    return fail(res, err.status ?? 500, err.code ?? 'INTERNAL_ERROR', 'Failed to fetch places', err.message);
  }
});

// ── /places/search — natural language search ───────────────────────────────
//
// Accepts freetext like "rooftop dinner with views in Casablanca".
// Gemini parses the query into city + intent + constraints, then returns
// matching places. The response envelope adds `city` and `intent` fields
// so the frontend can display what was interpreted.
//
// Response shape:
//   { ok: true, data: Place[], city: string, intent: string, cached: bool }
//
async function searchPlacesFromGemini(q) {
  const prompt = `You are a travel recommendation assistant. A user searched for: "${q}"

Parse the query and return matching places. Respond ONLY with valid JSON (no markdown, no extra text):
{
  "city": "the city name extracted from the query (string)",
  "intent": "a short phrase describing what the user is looking for, e.g. \\"rooftop restaurants with views\\" (string)",
  "places": [
    {
      "name": "string",
      "category": "string (e.g. Restaurant, Viewpoint, Museum, Park)",
      "rating": "number 1.0–5.0",
      "description": "string — 2 sentences explaining why this place matches the query",
      "address": "string",
      "must_visit": "boolean — true for the 3 best matches",
      "image_query": "string — 3–5 English words for an image search",
      "match_reason": "string — 1 sentence: which part of the query this place satisfies"
    }
  ]
}

Return exactly 10 places ordered by relevance to the query.`;

  const json = await callGemini(prompt);
  const parsed = parseGeminiText(json);

  if (!parsed.city || !Array.isArray(parsed.places)) {
    const err = new Error('Gemini search response has unexpected shape');
    err.code = 'GEMINI_PARSE_ERROR';
    err.status = 502;
    throw err;
  }

  return parsed; // { city, intent, places }
}

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
    const result = await searchPlacesFromGemini(q);
    const enriched = await enrichWithImages(result.places);
    const stored = { city: result.city, intent: result.intent, places: enriched };
    setCache(cacheKey, stored);
    return ok(res, enriched, { cached: false, city: result.city, intent: result.intent });
  } catch (err) {
    console.error('[ai-places/search]', err.message);
    return fail(res, err.status ?? 500, err.code ?? 'INTERNAL_ERROR', 'Failed to search places', err.message);
  }
});

module.exports = router;
