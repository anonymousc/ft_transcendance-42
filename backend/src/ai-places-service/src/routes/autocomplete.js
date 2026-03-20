const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const router = Router();

// Load city names from CSV (one name per line, all-caps)
const csvPath = path.join(__dirname, '../data/Morocco_City_List.csv');
const CITIES = fs
  .readFileSync(csvPath, 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)
  // Title-case each word: "BENI MELLAL" → "Beni Mellal"
  .map(c => c.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()));

// In-memory recent searches per user (userId → string[])
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

module.exports = router;
