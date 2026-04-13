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

function parseISODateOnly(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const [y, mo, d] = t.split('-').map(v => parseInt(v, 10));
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d)
    return null;
  return dt;
}

function inclusiveDaySpanUTC(start, end) {
  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
}

function formatDateUTC(d) {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

/** @returns {{ error: string } | { tripStart: Date|null, tripEnd: Date|null, spanDays: number|null }} */
function normalizeTripDates(tripStartDate, tripEndDate) {
  const hasS = tripStartDate != null && String(tripStartDate).trim() !== '';
  const hasE = tripEndDate != null && String(tripEndDate).trim() !== '';
  if (!hasS && !hasE) return { tripStart: null, tripEnd: null, spanDays: null };
  if (!hasS || !hasE)
    return { error: 'tripStartDate and tripEndDate must both be provided (YYYY-MM-DD)' };
  const s = parseISODateOnly(String(tripStartDate));
  const e = parseISODateOnly(String(tripEndDate));
  if (!s || !e) return { error: 'tripStartDate and tripEndDate must be valid YYYY-MM-DD' };
  if (e.getTime() < s.getTime())
    return { error: 'tripEndDate must be on or after tripStartDate' };
  const span = inclusiveDaySpanUTC(s, e);
  if (span < 1 || span > 14)
    return { error: 'trip must be between 1 and 14 days inclusive' };
  return { tripStart: s, tripEnd: e, spanDays: span };
}

function validatePreferences(preferences) {
  if (!Array.isArray(preferences)) return 'preferences must be an array of strings';
  if (preferences.length > 10) return 'preferences must contain 10 items or fewer';
  if (preferences.some(p => typeof p !== 'string' || !p.trim()))
    return 'each preference must be a non-empty string';
  return null;
}

function validateGenerateBody({ city, days, preferences, tripStartDate, tripEndDate }) {
  if (!city || typeof city !== 'string' || city.trim().length < 2)
    return 'city is required and must be at least 2 characters';
  if (!CITY_RE.test(city.trim())) return 'city contains invalid characters';

  const dates = normalizeTripDates(tripStartDate, tripEndDate);
  if (dates.error) return dates.error;

  if (dates.tripStart) {
    if (!Number.isInteger(days) || days !== dates.spanDays)
      return `days must equal the inclusive date range (${dates.spanDays} day(s))`;
  } else {
    if (!Number.isInteger(days) || days < 1 || days > 14)
      return 'days must be an integer between 1 and 14';
  }

  return validatePreferences(preferences);
}

function validateUpdateBody({ city, days, preferences, plan, tripStartDate, tripEndDate }) {
  const err = validateGenerateBody({ city, days, preferences, tripStartDate, tripEndDate });
  if (err) return err;
  if (!plan || typeof plan !== 'object' || Array.isArray(plan))
    return 'plan must be a JSON object';
  return null;
}

// POST /plan/generate
router.post('/plan/generate', authMiddleware, (req, res, next) => req.app.get('planGenerateLimiter')(req, res, next), async (req, res) => {
  const validationError = validateGenerateBody(req.body);
  if (validationError) return fail(res, 400, 'INVALID_INPUT', validationError);

  const { city, days, preferences, tripStartDate, tripEndDate } = req.body;
  const safeCity = city.trim();
  const safePrefs = preferences.map(p => p.trim()).filter(Boolean);
  const userId = req.user.id;
  const dates = normalizeTripDates(tripStartDate, tripEndDate);
  const effectiveDays = dates.tripStart ? dates.spanDays : days;
  let tripStartLabel = null;
  let tripEndLabel = null;
  if (dates.tripStart && dates.tripEnd) {
    tripStartLabel = formatDateUTC(dates.tripStart);
    tripEndLabel = formatDateUTC(dates.tripEnd);
  }

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
      days: effectiveDays,
      preferences: safePrefs,
      places,
      favorites,
      reviewSummaries,
      interests,
      tripStartLabel,
      tripEndLabel,
    });

    const tripPlan = await prisma.tripPlan.create({
      data: {
        userId,
        city: safeCity,
        days: effectiveDays,
        preferences: safePrefs,
        plan: generatedPlan,
        ...(dates.tripStart && dates.tripEnd
          ? { tripStartDate: dates.tripStart, tripEndDate: dates.tripEnd }
          : {}),
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
        tripStartDate: true,
        tripEndDate: true,
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

  const { city, days, preferences, plan, tripStartDate, tripEndDate } = req.body;
  const safeCity = city.trim();
  const safePrefs = preferences.map(p => p.trim()).filter(Boolean);
  const dateNorm = normalizeTripDates(tripStartDate, tripEndDate);
  if (dateNorm.error) return fail(res, 400, 'INVALID_INPUT', dateNorm.error);
  const effectiveDays = dateNorm.tripStart ? dateNorm.spanDays : days;
  if (dateNorm.tripStart && days !== effectiveDays) {
    return fail(
      res,
      400,
      'INVALID_INPUT',
      `days must equal the inclusive date range (${effectiveDays} day(s))`,
    );
  }

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
        days: effectiveDays,
        preferences: safePrefs,
        plan,
        ...(dateNorm.tripStart && dateNorm.tripEnd
          ? { tripStartDate: dateNorm.tripStart, tripEndDate: dateNorm.tripEnd }
          : {}),
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
