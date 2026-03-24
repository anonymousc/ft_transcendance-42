const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const router = Router();

const csvPath = path.join(__dirname, '../data/Morocco_City_List.csv');
const CITIES = fs
  .readFileSync(csvPath, 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)
  .map(c => c.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()));

const recentSearches = new Map();

router.get('/autocomplete', (req, res) => {
  const { q = '', userId } = req.query;
  if (q.length < 1) return res.json({ suggestions: [] });

  const query = q.toLowerCase();

  const matched = CITIES
    .filter(c => c.toLowerCase().startsWith(query))
    .slice(0, 6);

  const recent = userId ? (recentSearches.get(userId) ?? []) : [];
  const matchedRecent = recent
    .filter(r => r.toLowerCase().startsWith(query) && !matched.includes(r))
    .slice(0, 3);

  res.json({ suggestions: [...matchedRecent, ...matched].slice(0, 6) });
});

router.post('/autocomplete/recent', (req, res) => {
  const { userId, city } = req.body;
  if (!userId || !city) return res.status(400).json({ error: 'userId and city required' });

  const existing = recentSearches.get(userId) ?? [];
  const updated = [city, ...existing.filter(c => c !== city)].slice(0, 10);
  recentSearches.set(userId, updated);
  res.json({ ok: true });
});

// ── /autocomplete/places — Google Places Autocomplete fallback ─────────────
//
// Called by the frontend only when the static CSV search returns 0 results.
// Proxies the Google Places Autocomplete (New) API so the API key stays server-side.
//
// Query params: q (required, min 3 chars)
// Response: { suggestions: string[] }  — up to 5 city name strings
//
router.get('/autocomplete/places', async (req, res) => {
  const { q = '' } = req.query;
  const input = q.trim();

  if (input.length < 3) return res.json({ suggestions: [] });

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
      },
      body: JSON.stringify({
        input,
        includedPrimaryTypes: ['locality'],
        languageCode: 'en',
      }),
    });

    if (!response.ok) {
      console.error('[autocomplete/places] Google API error', response.status);
      return res.json({ suggestions: [] });
    }

    const data = await response.json();
    const suggestions = (data.suggestions ?? [])
      .slice(0, 5)
      .map(s => s?.placePrediction?.structuredFormat?.mainText?.text)
      .filter(Boolean);

    res.json({ suggestions });
  } catch (err) {
    console.error('[autocomplete/places]', err.message);
    res.json({ suggestions: [] });
  }
});

module.exports = router;
