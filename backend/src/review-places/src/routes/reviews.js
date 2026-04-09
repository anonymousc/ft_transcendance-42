const { Router } = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = Router();

function ok(res, data, extra = {}) {
  return res.json({ ok: true, data, ...extra });
}

function fail(res, status, code, message) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

function validateReviewBody({ placeName, city, rating, comment }) {
  if (!placeName || typeof placeName !== 'string' || !placeName.trim())
    return 'placeName is required';
  if (!city || typeof city !== 'string' || !city.trim())
    return 'city is required';
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5)
    return 'rating must be an integer between 1 and 5';
  if (!comment || typeof comment !== 'string' || comment.trim().length < 3)
    return 'comment must be at least 3 characters';
  if (comment.trim().length > 1000)
    return 'comment must be at most 1000 characters';
  return null;
}

// GET /reviews — public read
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
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to fetch reviews');
  }
});

// GET /reviews/summary — public read
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
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to fetch review summary');
  }
});

// GET /reviews/batch — public; returns aggregated ratings for multiple places at once
// Body: { places: [{ place: string, city: string }] }
router.post('/reviews/batch', async (req, res) => {
  const { places } = req.body;
  if (!Array.isArray(places) || places.length === 0) {
    return fail(res, 400, 'INVALID_INPUT', 'places must be a non-empty array of { place, city } objects');
  }
  if (places.length > 50) {
    return fail(res, 400, 'INVALID_INPUT', 'places array must contain 50 items or fewer');
  }

  try {
    const results = await Promise.all(
      places.map(async ({ place, city }) => {
        if (!place || !city) return { place, city, averageRating: null, totalReviews: 0 };

        const result = await prisma.review.aggregate({
          where: {
            placeName: { equals: place.trim(), mode: 'insensitive' },
            city:      { equals: city.trim(),  mode: 'insensitive' },
          },
          _avg:   { rating: true },
          _count: { id: true },
        });

        return {
          place: place.trim(),
          city:  city.trim(),
          averageRating: result._avg.rating ? parseFloat(result._avg.rating.toFixed(1)) : null,
          totalReviews:  result._count.id,
        };
      }),
    );
    return ok(res, results);
  } catch (err) {
    console.error('[review-places/batch]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to fetch batch review summaries');
  }
});

// POST /reviews — create a review; one per user per place enforced
router.post('/reviews', authMiddleware, async (req, res) => {
  const validationError = validateReviewBody(req.body);
  if (validationError) return fail(res, 400, 'INVALID_INPUT', validationError);

  const userId = req.user.id;
  const { placeName, city, rating, comment } = req.body;

  try {
    const existing = await prisma.review.findFirst({
      where: {
        userId,
        placeName: { equals: placeName.trim(), mode: 'insensitive' },
        city:      { equals: city.trim(),      mode: 'insensitive' },
      },
    });
    if (existing) {
      return fail(res, 409, 'DUPLICATE_REVIEW', 'You have already reviewed this place');
    }

    const review = await prisma.review.create({
      data: {
        placeName: placeName.trim(),
        city:      city.trim(),
        userId,
        rating,
        comment:   comment.trim(),
      },
    });
    return res.status(201).json({ ok: true, data: review });
  } catch (err) {
    console.error('[review-places/create]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to create review');
  }
});

// PATCH /reviews/:id — update own review
router.patch('/reviews/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { rating, comment } = req.body;

  if (rating !== undefined) {
    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return fail(res, 400, 'INVALID_INPUT', 'rating must be an integer between 1 and 5');
    }
  }
  if (comment !== undefined) {
    if (typeof comment !== 'string' || comment.trim().length < 3 || comment.trim().length > 1000) {
      return fail(res, 400, 'INVALID_INPUT', 'comment must be between 3 and 1000 characters');
    }
  }

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return fail(res, 404, 'NOT_FOUND', 'Review not found');
    if (review.userId !== userId) return fail(res, 403, 'FORBIDDEN', 'You can only edit your own reviews');

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(rating  !== undefined ? { rating }            : {}),
        ...(comment !== undefined ? { comment: comment.trim() } : {}),
      },
    });
    return ok(res, updated);
  } catch (err) {
    console.error('[review-places/update]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to update review');
  }
});

// DELETE /reviews/:id — only the owner may delete
router.delete('/reviews/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return fail(res, 404, 'NOT_FOUND', 'Review not found');
    if (review.userId !== userId) return fail(res, 403, 'FORBIDDEN', 'You can only delete your own reviews');

    await prisma.review.delete({ where: { id } });
    return ok(res, { id });
  } catch (err) {
    console.error('[review-places/delete]', err.message);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to delete review');
  }
});

module.exports = router;
