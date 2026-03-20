// src/routes/autocomplete.js
const CITIES = [
  "Casablanca", "Marrakech", "Rabat", "Fes", "Tangier", "Agadir",
  "Paris", "London", "New York", "Tokyo", "Dubai", "Barcelona",
  "Rome", "Amsterdam", "Istanbul", "Cairo", "Nairobi", "Lagos",
  "Dakar", "Tunis", "Algiers", "Beirut", "Amman", "Riyadh"
  // add more relevant to your target users
];

// in-memory recent searches per user (or store in Favorites service)
const recentSearches = new Map(); // userId -> string[]

app.get('/autocomplete', (req, res) => {
  const { q = '', userId } = req.query;
  if (q.length < 1) return res.json({ suggestions: [] });

  const query = q.toLowerCase();

  // match static cities
  const matched = CITIES
    .filter(c => c.toLowerCase().startsWith(query))
    .slice(0, 5);

  // prepend recent searches for this user that match
  const recent = userId ? (recentSearches.get(userId) ?? []) : [];
  const matchedRecent = recent
    .filter(r => r.toLowerCase().startsWith(query) && !matched.includes(r))
    .slice(0, 3);

  res.json({ suggestions: [...matchedRecent, ...matched].slice(0, 6) });
});

// call this when user actually submits a search
app.post('/autocomplete/recent', (req, res) => {
  const { userId, city } = req.body;
  if (!userId || !city) return res.status(400).json({ error: 'userId and city required' });

  const existing = recentSearches.get(userId) ?? [];
  const updated = [city, ...existing.filter(c => c !== city)].slice(0, 10);
  recentSearches.set(userId, updated);
  res.json({ ok: true });
});