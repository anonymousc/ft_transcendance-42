require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('./lib/redis');
const planRouter = require('./routes/plan');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT_PLAN || 7000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Strict rate limit for plan generation — each request calls Gemini Flash
const planGenerateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:planner:',
  }),
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: { code: 'RATE_LIMITED', message: 'Plan generation limit reached, please try again in an hour' },
  },
});
app.set('planGenerateLimiter', planGenerateLimiter);

app.use('/', healthRouter);
app.use('/', planRouter);

app.listen(PORT, () => {
  console.log(`Planner Service running on port ${PORT}`);
});
