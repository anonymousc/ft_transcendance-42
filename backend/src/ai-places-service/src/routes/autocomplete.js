const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const router = Router();

// ── Load city list ────────────────────────────────────────────────────────────
const csvPath = path.join(__dirname, '../data/Morocco_City_List.csv');
let CITIES = [];
try {
  const raw = fs.readFileSync(csvPath, 'utf8');
  // Store lowercase — no point normalizing to Title Case only to re-lowercase at query time
  CITIES = raw
    .split('\n')
    .map(line => line.trim().toLowerCase())
    .filter(Boolean);
} catch (err) {
  console.warn('[autocomplete] City CSV unavailable:', err.message);
}

// ── In-memory recent searches (replace with Redis in production) ──────────────
const MAX_RECENT_PER_USER = 10;
const MAX_USERS_CACHED = 5000;
const recentSearches = new Map();

function setRecent(userId, city) {
  // Evict oldest entry when the map grows too large
  if (!recentSearches.has(userId) && recentSearches.size >= MAX_USERS_CACHED) {
    recentSearches.delete(recentSearches.keys().next().value);
  }
  const existing = recentSearches.get(userId) ?? [];
  const updated = [city, ...existing.filter(c => c !== city)].slice(0, MAX_RECENT_PER_USER);
  recentSearches.set(userId, updated);
}

// ── Google Places helper ──────────────────────────────────────────────────────
async function googleCityAutocomplete(input) {
  const trimmed = (input ?? '').trim();
  if (trimmed.length < 3) return [];

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
      },
      body: JSON.stringify({
        input: trimmed,
        includedPrimaryTypes: ['locality'],
        languageCode: 'en',
      }),
    });

    if (!response.ok) {
      console.error('[autocomplete/google] Google API error', response.status);
      return [];
    }

    const data = await response.json();
    return (data.suggestions ?? [])
      .slice(0, 5)
      .map(s => s?.placePrediction?.structuredFormat?.mainText?.text)
      .filter(Boolean);
  } catch (err) {
    console.error('[autocomplete/google]', err.message);
    return [];
  }
}

// ── GET /autocomplete ─────────────────────────────────────────────────────────
// Primary autocomplete: static CSV + recent searches (from token identity).
// Falls back to Google only if both sources return nothing and q >= 3 chars.
router.get('/autocomplete', async (req, res) => {
  const { q = '' } = req.query;
  const query = q.trim().toLowerCase();

  if (query.length < 1) return res.json({ suggestions: [] });

  const matched = CITIES
    .filter(c => c.startsWith(query))
    .slice(0, 6)
    .map(c => c.replace(/\b\w/g, l => l.toUpperCase()));

  // userId always comes from the verified JWT — never from the query string
  const userId = req.user?.id;
  const recent = userId ? (recentSearches.get(userId) ?? []) : [];
  const matchedRecent = recent
    .filter(r => r.toLowerCase().startsWith(query) && !matched.includes(r))
    .slice(0, 3);

  const combined = [...matchedRecent, ...matched].slice(0, 6);

  if (combined.length === 0 && query.length >= 3) {
    try {
      const suggestions = await googleCityAutocomplete(query);
      return res.json({ suggestions });
    } catch {
      return res.json({ suggestions: [] });
    }
  }

  res.json({ suggestions: combined });
});

// ── POST /autocomplete/recent ─────────────────────────────────────────────────
// Records a confirmed city selection; identity taken from the verified JWT.
router.post('/autocomplete/recent', (req, res) => {
  const userId = req.user.id;
  const { city } = req.body;

  if (!city || typeof city !== 'string' || city.trim().length === 0 || city.length > 100) {
    return res.status(400).json({ error: 'city must be a non-empty string under 100 chars' });
  }

  setRecent(userId, city.trim());
  res.json({ ok: true });
});

module.exports = router;