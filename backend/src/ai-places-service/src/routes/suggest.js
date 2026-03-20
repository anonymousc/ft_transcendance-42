// ─── /places/suggest ────────────────────────────────────────────────────────
// Drop this block into your existing server.js, after your /places route.
//
// Expected request body:
// {
//   "city": "Marrakech",
//   "preferences": ["street food", "history", "outdoor"],  // from user profile
//   "visited": ["Jemaa el-Fna", "Majorelle Garden"],       // optional, from user history
//   "limit": 5                                              // optional, default 5
// }
// ────────────────────────────────────────────────────────────────────────────

async function fetchSuggestionsFromGemini(city, preferences, visited, limit) {
  const visitedClause =
    visited.length > 0
      ? `They have already visited these places and must NOT appear in your response: ${visited.join(', ')}.`
      : 'They have not visited any places yet.';

  const prompt = `You are a travel recommendation assistant.
Suggest exactly ${limit} places to visit in ${city} for someone who enjoys: ${preferences.join(', ')}.
${visitedClause}
Prioritise places that closely match their interests. Be specific — avoid generic tourist traps unless they genuinely fit the preferences.

Respond ONLY with a valid JSON array, no markdown, no extra text. Each object must have:
- name: string
- category: string (e.g. "Museum", "Park", "Restaurant")
- rating: number (1.0 - 5.0)
- description: string (2 sentences explaining why it matches their interests)
- address: string
- must_visit: boolean (true for the single best match)
- image_query: string (3-5 words in English for image search)
- match_reason: string (1 sentence: which preference this place satisfies)`;

  const json = await callGemini(prompt);
  const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  return JSON.parse(cleaned);
}

// Cache key includes preferences so different users get different cached results
function getSuggestCacheKey(city, preferences, visited) {
  const prefKey = [...preferences].sort().join(',');
  const visitKey = [...visited].sort().join(',');
  return `suggest::${city.toLowerCase()}::${prefKey}::${visitKey}`;
}

app.post('/places/suggest', async (req, res) => {
  const { city, preferences, visited = [], limit = 5 } = req.body;

  // ── Validation ──────────────────────────────────────────────────────────
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

  // ── Cache check ─────────────────────────────────────────────────────────
  const cacheKey = getSuggestCacheKey(safeCity, preferences, visited);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json({ suggestions: cached.data, cached: true });
  }

  // ── Gemini call + image enrichment ──────────────────────────────────────
  try {
    const suggestions = await fetchSuggestionsFromGemini(
      safeCity,
      preferences,
      visited,
      safeLimit
    );

    const enriched = await Promise.all(
      suggestions.map(async (place) => {
        const imageUrl = await fetchUnsplashImage(place.image_query || place.name);
        return { ...place, image: imageUrl };
      })
    );

    cache.set(cacheKey, { data: enriched, timestamp: Date.now() });
    return res.json({ suggestions: enriched, cached: false });
  } catch (err) {
    console.error('[ai-places/suggest]', err.message);
    return res.status(500).json({ error: 'Failed to fetch suggestions', details: err.message });
  }
});