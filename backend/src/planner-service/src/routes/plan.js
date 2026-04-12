const { Router } = require('express');
const prisma = require('../lib/prisma');
const { callTextSearch } = require('../lib/google-places');
const { fetchUserFavorites, fetchReviewSummariesForPlaces } = require('../lib/service-client');
const { fetchUserInterests } = require('../lib/fetchUserInterests');
const { generateTripPlan } = require('../lib/gemini');
const authMiddleware = require('../middleware/auth');
const { getValidGoogleAccessToken } = require('../helpers/googleToken');
const { buildCalendarEvents } = require('../helpers/buildCalendarEvents');

const router = Router();

function ok(res, data, extra = {}) {
  return res.json({ ok: true, data, ...extra });
}

function fail(res, status, code, message, details) {
  const body = { ok: false, error: { code, message } };
  if (details !== undefined) body.error.details = details;
  return res.status(status).json(body);
}

const CITY_RE = /^[\p{L}\p{M}\s'\-,.]+$/u;

function validateGenerateBody({ city, days, preferences }) {
  if (!city || typeof city !== 'string' || city.trim().length < 2)
    return 'city is required and must be at least 2 characters';
  if (!CITY_RE.test(city.trim()))
    return 'city contains invalid characters';
  if (!Number.isInteger(days) || days < 1 || days > 14)
    return 'days must be an integer between 1 and 14';
  if (!Array.isArray(preferences))
    return 'preferences must be an array of strings';
  if (preferences.length > 10)
    return 'preferences must contain 10 items or fewer';
  if (preferences.some(p => typeof p !== 'string' || !p.trim()))
    return 'each preference must be a non-empty string';
  return null;
}

function validateUpdateBody({ city, days, preferences, plan }) {
  const err = validateGenerateBody({ city, days, preferences });
  if (err) return err;
  if (!plan || typeof plan !== 'object' || Array.isArray(plan))
    return 'plan must be a JSON object';
  return null;
}

// POST /plan/generate
router.post('/plan/generate', authMiddleware, (req, res, next) => req.app.get('planGenerateLimiter')(req, res, next), async (req, res) => {
  const validationError = validateGenerateBody(req.body);
  if (validationError) return fail(res, 400, 'INVALID_INPUT', validationError);

  const { city, days, preferences } = req.body;
  const safeCity = city.trim();
  const safePrefs = preferences.map(p => p.trim()).filter(Boolean);
  const userId = req.user.id;

  try {
    const [places, favorites, interests] = await Promise.all([
      callTextSearch(`best places to visit in ${safeCity}`, 20),
      fetchUserFavorites(userId, safeCity),
      fetchUserInterests(userId),
    ]);

    if (!places.length) {
      return fail(res, 422, 'NO_PLACES_FOUND', `No places found for city: ${safeCity}`);
    }

    const reviewSummaries = await fetchReviewSummariesForPlaces(places.slice(0, 15), safeCity);

    const generatedPlan = await generateTripPlan({
      city: safeCity,
      days,
      preferences: safePrefs,
      places,
      favorites,
      reviewSummaries,
      interests,
    });

    const tripPlan = await prisma.tripPlan.create({
      data: {
        userId,
        city: safeCity,
        days,
        preferences: safePrefs,
        plan: generatedPlan,
      },
    });

    return res.status(201).json({ ok: true, data: tripPlan });
  } catch (err) {
    console.error('[plan/generate]', err.message);
    if (err.code === 'PLACES_ERROR' || err.code === 'PLACES_UNAVAILABLE') {
      return fail(res, 502, err.code, 'Failed to fetch places from Google', err.message);
    }
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to generate trip plan', err.message);
  }
});

// GET /plan/:id
router.get('/plan/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const tripPlan = await prisma.tripPlan.findUnique({ where: { id } });

    if (!tripPlan) {
      return fail(res, 404, 'NOT_FOUND', 'Trip plan not found');
    }
    if (tripPlan.userId !== userId) {
      return fail(res, 403, 'FORBIDDEN', 'You can only access your own trip plans');
    }

    return ok(res, tripPlan);
  } catch (err) {
    console.error('[plan/get]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to fetch trip plan', err.message);
  }
});

// GET /plans
router.get('/plans', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { city } = req.query;

  const where = { userId };
  if (city && typeof city === 'string' && city.trim()) {
    where.city = { equals: city.trim(), mode: 'insensitive' };
  }

  try {
    const plans = await prisma.tripPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        city: true,
        days: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ok(res, plans);
  } catch (err) {
    console.error('[plans/list]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to fetch trip plans', err.message);
  }
});

// PUT /plan/:id
router.put('/plan/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const validationError = validateUpdateBody(req.body);
  if (validationError) return fail(res, 400, 'INVALID_INPUT', validationError);

  const { city, days, preferences, plan } = req.body;
  const safeCity = city.trim();
  const safePrefs = preferences.map(p => p.trim()).filter(Boolean);

  try {
    const tripPlan = await prisma.tripPlan.findUnique({ where: { id } });

    if (!tripPlan) {
      return fail(res, 404, 'NOT_FOUND', 'Trip plan not found');
    }
    if (tripPlan.userId !== userId) {
      return fail(res, 403, 'FORBIDDEN', 'You can only update your own trip plans');
    }

    const updated = await prisma.tripPlan.update({
      where: { id },
      data: {
        city: safeCity,
        days,
        preferences: safePrefs,
        plan,
      },
    });

    return ok(res, updated);
  } catch (err) {
    console.error('[plan/put]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to update trip plan', err.message);
  }
});

const GCAL_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

async function insertGoogleCalendarEvent(accessToken, event) {
  const res = await fetch(GCAL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (res.ok) return res.json();

  let text = '';
  try {
    text = await res.text();
  } catch {
    text = '';
  }
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }
  const ge = parsed?.error;
  let msg = ge?.message || (text ? text.slice(0, 240) : '') || `Google Calendar API error (${res.status})`;
  const reason = ge?.errors?.[0]?.reason;
  const lower = String(msg).toLowerCase();

  if (
    res.status === 403 &&
    (reason === 'insufficientPermissions' ||
      lower.includes('insufficient permission') ||
      lower.includes('access not configured'))
  ) {
    msg =
      'Google Calendar permission missing. Sign out and sign in again with Google so the app can add events, and confirm Calendar API is enabled in Google Cloud.';
  } else if (res.status === 403 && reason === 'forbidden') {
    msg =
      'Google blocked Calendar access (403). Reconnect Google on this app or check API/quotas in Google Cloud Console.';
  } else if (res.status === 401) {
    msg =
      'Google rejected the access token. Sign out and sign in with Google again, then retry export.';
  }

  const err = new Error(msg);
  err.status = res.status;
  throw err;
}

// POST /plan/:id/export/google-calendar
router.post('/plan/:id/export/google-calendar', authMiddleware, async (req, res) => {
  const planId = req.params.id;
  const userId = req.user.id;

  try {
    const plan = await prisma.tripPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) {
      return res.status(404).json({ ok: false, error: { message: 'Plan not found' } });
    }

    let accessToken;
    try {
      accessToken = await getValidGoogleAccessToken(req);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google token error';
      return res.status(403).json({ ok: false, error: { message } });
    }

    const events = buildCalendarEvents(plan);
    if (events.length === 0) {
      return res.json({ ok: true, data: { total: 0, failed: 0 } });
    }

    /** Sequential inserts avoid user rate limits from parallel bursts. */
    const rejected = [];
    for (let i = 0; i < events.length; i++) {
      try {
        await insertGoogleCalendarEvent(accessToken, events[i]);
      } catch (err) {
        if (rejected.length === 0) {
          console.error(
            '[plan/export/google-calendar] first event failure',
            events[i]?.summary,
            err instanceof Error ? err.message : err
          );
        }
        rejected.push(err);
      }
    }

    const failed = rejected.length;
    const firstError =
      failed > 0 && rejected[0] instanceof Error ? rejected[0].message : undefined;

    return res.json({
      ok: true,
      data: { total: events.length, failed, ...(firstError ? { firstError } : {}) },
    });
  } catch (err) {
    console.error('[plan/export/google-calendar]', err.message);
    return res.status(500).json({ ok: false, error: { message: 'Export failed' } });
  }
});

// DELETE /plan/:id
router.delete('/plan/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const tripPlan = await prisma.tripPlan.findUnique({ where: { id } });

    if (!tripPlan) {
      return fail(res, 404, 'NOT_FOUND', 'Trip plan not found');
    }
    if (tripPlan.userId !== userId) {
      return fail(res, 403, 'FORBIDDEN', 'You can only delete your own trip plans');
    }

    await prisma.tripPlan.delete({ where: { id } });
    return ok(res, { id });
  } catch (err) {
    console.error('[plan/delete]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to delete trip plan', err.message);
  }
});

module.exports = router;
