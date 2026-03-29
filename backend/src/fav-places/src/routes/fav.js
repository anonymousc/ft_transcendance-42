const { Router } = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = Router();

const VALID_STATUSES = new Set(['favorited', 'visited']);

function ok(res, data, extra = {}) {
  return res.json({ ok: true, data, ...extra });
}

function fail(res, status, code, message) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

function validateSaveBody({ placeName, city, category, address, status }) {
  if (!placeName || typeof placeName !== 'string' || !placeName.trim())
    return 'placeName is required';
  if (!city || typeof city !== 'string' || !city.trim())
    return 'city is required';
  if (!category || typeof category !== 'string' || !category.trim())
    return 'category is required';
  if (!address || typeof address !== 'string' || !address.trim())
    return 'address is required';
  if (status !== undefined && !VALID_STATUSES.has(status))
    return 'status must be "favorited" or "visited"';
  return null;
}

// Save (or update) a place for the authenticated user
router.post('/fav-places', authMiddleware, async (req, res) => {
  const validationError = validateSaveBody(req.body);
  if (validationError) return fail(res, 400, 'INVALID_INPUT', validationError);

  const userId = req.user.id;
  const { placeName, city, category, address, image, rating, status = 'favorited' } = req.body;

  try {
    const saved = await prisma.savedPlace.upsert({
      where: { userId_placeName_city: { userId, placeName: placeName.trim(), city: city.trim() } },
      update: {
        category: category.trim(),
        address:  address.trim(),
        image:    image ?? null,
        rating:   rating ?? null,
        status,
      },
      create: {
        userId,
        placeName: placeName.trim(),
        city:      city.trim(),
        category:  category.trim(),
        address:   address.trim(),
        image:     image ?? null,
        rating:    rating ?? null,
        status,
      },
    });
    return res.status(201).json({ ok: true, data: saved });
  } catch (err) {
    console.error('[fav-places/save]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to save place');
  }
});

// Unsave a place — only the owner may delete
router.delete('/fav-places/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const saved = await prisma.savedPlace.findUnique({ where: { id } });
    if (!saved) return fail(res, 404, 'NOT_FOUND', 'Saved place not found');
    if (saved.userId !== userId) return fail(res, 403, 'FORBIDDEN', 'You can only remove your own saved places');

    await prisma.savedPlace.delete({ where: { id } });
    return ok(res, { id });
  } catch (err) {
    console.error('[fav-places/delete]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to remove saved place');
  }
});

// GET /fav-places — the authenticated user's places, optionally filtered by status
router.get('/fav-places', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { status } = req.query;

  if (status !== undefined && !VALID_STATUSES.has(status)) {
    return fail(res, 400, 'INVALID_INPUT', 'status must be "favorited" or "visited"');
  }

  try {
    const where = { userId, ...(status ? { status } : {}) };
    const places = await prisma.savedPlace.findMany({
      where,
      orderBy: { savedAt: 'desc' },
    });
    return ok(res, places);
  } catch (err) {
    console.error('[fav-places/list]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to fetch saved places');
  }
});

// GET /fav-places/public/:userId — public; anyone can view another user's favorites
router.get('/fav-places/public/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId || !userId.trim()) return fail(res, 400, 'INVALID_INPUT', 'userId is required');

  try {
    const places = await prisma.savedPlace.findMany({
      where: { userId: userId.trim() },
      orderBy: { savedAt: 'desc' },
    });
    return ok(res, places);
  } catch (err) {
    console.error('[fav-places/public]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to fetch public saved places');
  }
});

// GET /fav-places/check — check if the authenticated user has saved a place
router.get('/fav-places/check', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { placeName, city } = req.query;

  if (!placeName || !city) {
    return fail(res, 400, 'INVALID_INPUT', 'placeName and city query parameters are required');
  }

  try {
    const saved = await prisma.savedPlace.findUnique({
      where: {
        userId_placeName_city: {
          userId,
          placeName: placeName.trim(),
          city:      city.trim(),
        },
      },
    });
    return ok(res, { saved: !!saved, id: saved?.id ?? null, status: saved?.status ?? null });
  } catch (err) {
    console.error('[fav-places/check]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to check saved place');
  }
});

module.exports = router;
