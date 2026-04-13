const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  listNotifications,
  readNotification,
  readAllNotifications,
  archiveNotification,
} = require('../services/notificationService');

const router = express.Router();

router.use(authMiddleware);

function ok(res, data) {
  return res.json({ ok: true, data });
}

function fail(res, status, code, message) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

/** GET /notifications */
router.get('/', async (req, res) => {
  try {
    const data = await listNotifications(req.userId);
    return ok(res, data);
  } catch (e) {
    console.error('[notifications] list notifications', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to list notifications');
  }
});

/** PATCH /notifications/read?id=<notificationId> */
router.patch('/read', async (req, res) => {
  const id =
    typeof req.query.id === 'string' && req.query.id.trim()
      ? req.query.id.trim()
      : '';
  try {
    const result = await readNotification(req.userId, id);
    if (result.error) {
      const { status, code, message } = result.error;
      return fail(res, status, code, message);
    }
    return ok(res, result.notification);
  } catch (e) {
    console.error('[notifications] read notification', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to read notification');
  }
});

/** PATCH /notifications/readAll */
router.patch('/readAll', async (req, res) => {
  try {
    const result = await readAllNotifications(req.userId);
    return ok(res, { count: result.count });
  } catch (e) {
    console.error('[notifications] read all notifications', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to read all notifications');
  }
});

/** PATCH /notifications/archive?id=<notificationId> — hides from GET /notifications permanently */
router.patch('/archive', async (req, res) => {
  const id =
    typeof req.query.id === 'string' && req.query.id.trim()
      ? req.query.id.trim()
      : '';
  try {
    const result = await archiveNotification(req.userId, id);
    if (result.error) {
      const { status, code, message } = result.error;
      return fail(res, status, code, message);
    }
    return ok(res, result.notification);
  } catch (e) {
    console.error('[notifications] archive notification', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to archive notification');
  }
});

module.exports = router;
