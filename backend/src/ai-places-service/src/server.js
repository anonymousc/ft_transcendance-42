// require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('./lib/redis');
const authMiddleware = require('./middleware/auth');
const autocompleteRouter = require('./routes/autocomplete');
const { router: placesRouter, photoProxyHandler } = require('./routes/places');
const suggestRouter = require('./routes/suggest');

const app = express();
const PORT = process.env.PORT || 4000;

// Behind Nginx (single reverse-proxy hop). Trust exactly one proxy so
// express-rate-limit reads the real client IP from X-Forwarded-For without
// allowing clients to spoof it. Do NOT use `true` here (it trusts all hops).
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://rihla.tech',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check — public, no auth, no rate limit
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global rate limit: 200 req / 15 min per IP (covers all routes below)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:ai-places:global:',
  }),
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } },
});

// Strict limit for routes that call Google Places API (cost-sensitive)
const placesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:ai-places:places:',
  }),
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { code: 'RATE_LIMITED', message: 'Places search limit reached, please try again later' } },
});

// Autocomplete — public GET, no auth required; POST /autocomplete/recent guards itself
app.use(globalLimiter);
app.use('/', autocompleteRouter);

// Photo proxy — public; <img> requests are cross-origin and cannot attach session cookies reliably
app.get('/places/photos', placesLimiter, photoProxyHandler);

// Apply auth to all routes below this point
app.use(authMiddleware);

// Places routes — expensive Google API calls, tighter limit
app.use(placesLimiter);
app.use('/', placesRouter);
app.use('/', suggestRouter);

app.listen(PORT, () => {
  console.log(`AI Places Service running on port ${PORT}`);
});
