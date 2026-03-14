require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

app.use(cors());
app.use(express.json());

const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

function getCached(city) {
  const entry = cache.get(city.toLowerCase());
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(city.toLowerCase());
    return null;
  }
  return entry.data;
}

function setCache(city, data) {
  cache.set(city.toLowerCase(), { data, timestamp: Date.now() });
}

const GEMINI_MODEL = 'gemini-2.5-flash';

async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
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
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  return res.json();
}

async function fetchPlacesFromGemini(city) {
  const prompt = `List 10 must-visit places in ${city}. Respond ONLY with a valid JSON array, no markdown, no extra text. Each object must have:
- name: string
- category: string (e.g. "Museum", "Park", "Restaurant")
- rating: number (1.0 - 5.0)
- description: string (2 sentences, why it's worth visiting)
- address: string
- must_visit: boolean (true for top 3 highlights)
- image_query: string (3-5 words in English for image search, e.g. "Jemaa el-Fna square Marrakech")`;

  const json = await callGemini(prompt);
  const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  return JSON.parse(cleaned);
}

async function fetchUnsplashImage(query) {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.results?.[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

app.get('/places', async (req, res) => {
  const city = (req.query.city || '').trim();

  if (!city) {
    return res.status(400).json({ error: 'city query parameter is required' });
  }

  const cached = getCached(city);
  if (cached) {
    return res.json(cached);
  }

  try {
    const places = await fetchPlacesFromGemini(city);

    const enriched = await Promise.all(
      places.map(async (place) => {
        const imageUrl = await fetchUnsplashImage(place.image_query || place.name);
        return { ...place, image: imageUrl };
      })
    );

    setCache(city, enriched);
    return res.json(enriched);
  } catch (err) {
    console.error('[ai-places]', err.message);
    return res.status(500).json({ error: 'Failed to fetch places', details: err.message });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`AI Places Service running on port ${PORT}`);
});
