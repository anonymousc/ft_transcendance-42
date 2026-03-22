const { Router } = require('express');
const prisma = require('../lib/prisma');

const router = Router();

// ── Envelope helpers ───────────────────────────────────────────────────────
function ok(res, data, extra = {}) {
  return res.json({ ok: true, data, ...extra });
}

function fail(res, status, code, message, details) {
  const body = { ok: false, error: { code, message } };
  if (details !== undefined) body.error.details = details;
  return res.status(status).json(body);
}

// ── Validation ─────────────────────────────────────────────────────────────
function validateSaveBody({ userId, placeName, city, category, address }) {
  if (!userId || typeof userId !== 'string' || !userId.trim())
    return 'userId is required';
  if (!placeName || typeof placeName !== 'string' || !placeName.trim())
    return 'placeName is required';
  if (!city || typeof city !== 'string' || !city.trim())
    return 'city is required';
  if (!category || typeof category !== 'string' || !category.trim())
    return 'category is required';
  if (!address || typeof address !== 'string' || !address.trim())
    return 'address is required';
  return null;
}

// ── POST /fav-places ───────────────────────────────────────────────────────
// Save a place for a user
router.post('/fav-places', async (req, res) => {
  const validationError = validateSaveBody(req.body);
  if (validationError) {
    return fail(res, 400, 'INVALID_INPUT', validationError);
  }

  const { userId, placeName, city, category, address, image, rating } = req.body;

  try {
    const saved = await prisma.savedPlace.upsert({
      where: { userId_placeName_city: { userId: userId.trim(), placeName: placeName.trim(), city: city.trim() } },
      update: { category: category.trim(), address: address.trim(), image: image ?? null, rating: rating ?? null },
      create: {
        userId:    userId.trim(),
        placeName: placeName.trim(),
        city:      city.trim(),
        category:  category.trim(),
        address:   address.trim(),
        image:     image ?? null,
        rating:    rating ?? null,
      },
    });
    return res.status(201).json({ ok: true, data: saved });
  } catch (err) {
    console.error('[fav-places/save]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to save place', err.message);
  }
});

// ── DELETE /fav-places/:id ─────────────────────────────────────────────────
// Unsave a place. userId must match the owner.
router.delete('/fav-places/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return fail(res, 400, 'INVALID_INPUT', 'userId query parameter is required');
  }

  try {
    const saved = await prisma.savedPlace.findUnique({ where: { id } });
    if (!saved) {
      return fail(res, 404, 'NOT_FOUND', 'Saved place not found');
    }
    if (saved.userId !== userId) {
      return fail(res, 403, 'FORBIDDEN', 'You can only remove your own saved places');
    }

    await prisma.savedPlace.delete({ where: { id } });
    return ok(res, { id });
  } catch (err) {
    console.error('[fav-places/delete]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to remove saved place', err.message);
  }
});

// ── GET /fav-places?userId= ────────────────────────────────────────────────
// Private: get the calling user's own saved places, newest first
router.get('/fav-places', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return fail(res, 400, 'INVALID_INPUT', 'userId query parameter is required');
  }

  try {
    const places = await prisma.savedPlace.findMany({
      where: { userId: userId.trim() },
      orderBy: { savedAt: 'desc' },
    });
    return ok(res, places);
  } catch (err) {
    console.error('[fav-places/list]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to fetch saved places', err.message);
  }
});

// ── GET /fav-places/public/:userId ─────────────────────────────────────────
// Public: anyone can view another user's saved places (for profiles)
router.get('/fav-places/public/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId || !userId.trim()) {
    return fail(res, 400, 'INVALID_INPUT', 'userId path parameter is required');
  }

  try {
    const places = await prisma.savedPlace.findMany({
      where: { userId: userId.trim() },
      orderBy: { savedAt: 'desc' },
    });
    return ok(res, places);
  } catch (err) {
    console.error('[fav-places/public]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to fetch public saved places', err.message);
  }
});

// ── GET /fav-places/check ──────────────────────────────────────────────────
// Check if a specific place is saved by a user
router.get('/fav-places/check', async (req, res) => {
  const { userId, placeName, city } = req.query;
  if (!userId || !placeName || !city) {
    return fail(res, 400, 'INVALID_INPUT', 'userId, placeName and city query parameters are required');
  }

  try {
    const saved = await prisma.savedPlace.findUnique({
      where: {
        userId_placeName_city: {
          userId:    userId.trim(),
          placeName: placeName.trim(),
          city:      city.trim(),
        },
      },
    });
    return ok(res, { saved: !!saved, id: saved?.id ?? null });
  } catch (err) {
    console.error('[fav-places/check]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to check saved place', err.message);
  }
});

module.exports = router;
