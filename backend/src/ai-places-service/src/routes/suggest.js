const { Router } = require('express');
const { callGoogleTextSearch, mapGooglePlace, cache, CACHE_TTL_MS } = require('./places');

const router = Router();

// ─── /places/suggest ────────────────────────────────────────────────────────
// POST /places/suggest
//
// Request body:
// {
//   "city": "Marrakech",
//   "preferences": ["street food", "history", "outdoor"],
//   "visited": ["Jemaa el-Fna", "Majorelle Garden"],   // optional
//   "limit": 5                                          // optional, default 5
// }
//
// Response:
// { "suggestions": Place[], "cached": boolean }
// ────────────────────────────────────────────────────────────────────────────

function getSuggestCacheKey(city, preferences, visited) {
  const prefKey = [...preferences].sort().join(',');
  const visitKey = [...visited].sort().join(',');
  return `suggest::${city.toLowerCase()}::${prefKey}::${visitKey}`;
}

router.post('/places/suggest', async (req, res) => {
  const { city, preferences, visited = [], limit = 5 } = req.body;

  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    return res.status(400).json({ error: 'city is required and must be at least 2 characters' });
  }

  if (!Array.isArray(preferences) || preferences.length === 0) {
    return res.status(400).json({ error: 'preferences must be a non-empty array of strings' });
  }

  if (preferences.length > 10) {
    return res.status(400).json({ error: 'preferences must contain 10 items or fewer' });
  }

  if (!Array.isArray(visited)) {
    return res.status(400).json({ error: 'visited must be an array of place name strings' });
  }

  const safeLimit = Math.min(Math.max(parseInt(limit) || 5, 1), 10);
  const safeCity = city.trim();

  const cacheKey = getSuggestCacheKey(safeCity, preferences, visited);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json({ suggestions: cached.data, cached: true });
  }

  try {
    // Fetch more than needed so visited filtering doesn't leave us short
    const textQuery = `${preferences.join(', ')} places in ${safeCity}`;
    const rawPlaces = await callGoogleTextSearch(textQuery, Math.min(safeLimit * 3, 20));

    const visitedLower = visited.map(v => v.toLowerCase());
    const filtered = rawPlaces
      .filter(raw => !visitedLower.includes((raw.displayName?.text ?? '').toLowerCase()))
      .slice(0, safeLimit);

    const suggestions = filtered.map((raw, i) => mapGooglePlace(raw, i, preferences));

    cache.set(cacheKey, { data: suggestions, timestamp: Date.now() });
    return res.json({ suggestions, cached: false });
  } catch (err) {
    console.error('[ai-places/suggest]', err.message);
    return res.status(500).json({ error: 'Failed to fetch suggestions', details: err.message });
  }
});

module.exports = router;
