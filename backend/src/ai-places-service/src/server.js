require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middleware/auth');
const autocompleteRouter = require('./routes/autocomplete');
const { router: placesRouter } = require('./routes/places');
const suggestRouter = require('./routes/suggest');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check — public, no auth, no rate limit
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global rate limit: 200 req / 15 min per IP (covers all routes below)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } },
});

// Strict limit for routes that call Google Places API (cost-sensitive)
const placesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { code: 'RATE_LIMITED', message: 'Places search limit reached, please try again later' } },
});

// Apply auth to all routes below this point
app.use(globalLimiter);
app.use(authMiddleware);

// Autocomplete — lower cost, higher limit already covered by globalLimiter
app.use('/', autocompleteRouter);

// Places routes — expensive Google API calls, tighter limit
app.use(placesLimiter);
app.use('/', placesRouter);
app.use('/', suggestRouter);

app.listen(PORT, () => {
  console.log(`AI Places Service running on port ${PORT}`);
});
