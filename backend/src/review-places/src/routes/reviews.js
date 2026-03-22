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
function validateReviewBody({ placeName, city, userId, rating, comment }) {
  if (!placeName || typeof placeName !== 'string' || !placeName.trim())
    return 'placeName is required';
  if (!city || typeof city !== 'string' || !city.trim())
    return 'city is required';
  if (!userId || typeof userId !== 'string' || !userId.trim())
    return 'userId is required';
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5)
    return 'rating must be an integer between 1 and 5';
  if (!comment || typeof comment !== 'string' || comment.trim().length < 3)
    return 'comment must be at least 3 characters';
  if (comment.trim().length > 1000)
    return 'comment must be at most 1000 characters';
  return null;
}

// ── GET /reviews?place=<name>&city=<city> ──────────────────────────────────
// Returns all reviews for a place, newest first
router.get('/reviews', async (req, res) => {
  const { place, city } = req.query;
  if (!place || !city) {
    return fail(res, 400, 'INVALID_INPUT', 'place and city query parameters are required');
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        placeName: { equals: place.trim(), mode: 'insensitive' },
        city:      { equals: city.trim(),  mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, reviews);
  } catch (err) {
    console.error('[review-places/reviews]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to fetch reviews', err.message);
  }
});

// ── GET /reviews/summary?place=<name>&city=<city> ─────────────────────────
// Returns average rating + total review count
router.get('/reviews/summary', async (req, res) => {
  const { place, city } = req.query;
  if (!place || !city) {
    return fail(res, 400, 'INVALID_INPUT', 'place and city query parameters are required');
  }

  try {
    const result = await prisma.review.aggregate({
      where: {
        placeName: { equals: place.trim(), mode: 'insensitive' },
        city:      { equals: city.trim(),  mode: 'insensitive' },
      },
      _avg:   { rating: true },
      _count: { id: true },
    });

    return ok(res, {
      averageRating: result._avg.rating ? parseFloat(result._avg.rating.toFixed(1)) : null,
      totalReviews:  result._count.id,
    });
  } catch (err) {
    console.error('[review-places/summary]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to fetch review summary', err.message);
  }
});

// ── POST /reviews ──────────────────────────────────────────────────────────
// Create a new review
router.post('/reviews', async (req, res) => {
  const validationError = validateReviewBody(req.body);
  if (validationError) {
    return fail(res, 400, 'INVALID_INPUT', validationError);
  }

  const { placeName, city, userId, rating, comment } = req.body;

  try {
    const review = await prisma.review.create({
      data: {
        placeName: placeName.trim(),
        city:      city.trim(),
        userId:    userId.trim(),
        rating,
        comment:   comment.trim(),
      },
    });
    return res.status(201).json({ ok: true, data: review });
  } catch (err) {
    console.error('[review-places/create]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to create review', err.message);
  }
});

// ── DELETE /reviews/:id ────────────────────────────────────────────────────
// Delete a review. userId must match the review owner.
router.delete('/reviews/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return fail(res, 400, 'INVALID_INPUT', 'userId query parameter is required');
  }

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return fail(res, 404, 'NOT_FOUND', 'Review not found');
    }
    if (review.userId !== userId) {
      return fail(res, 403, 'FORBIDDEN', 'You can only delete your own reviews');
    }

    await prisma.review.delete({ where: { id } });
    return ok(res, { id });
  } catch (err) {
    console.error('[review-places/delete]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to delete review', err.message);
  }
});

module.exports = router;
