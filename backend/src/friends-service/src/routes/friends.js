const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const {
  sendFriendRequestTx,
  acceptFriendRequestTx,
  cancelOrDeclineRequestTx,
  getOtherUserIdInFriendship,
  removeFriendship,
} = require('../services/friendshipService');

const router = express.Router();

router.use(authMiddleware);

function toFriendDto(userId) {
  return {
    id: userId,
    name: `User ${userId.slice(0, 8)}`,
    isOnline: false,
    username: undefined,
    email: undefined,
    bio: undefined,
    status: 'offline',
  };
}

function ok(res, data) {
  return res.json({ ok: true, data });
}

function fail(res, status, code, message) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

router.get('/requests/incoming', async (req, res) => {
  try {
    const rows = await prisma.friendRequest.findMany({
      where: { toUserId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, rows);
  } catch (e) {
    console.error('[friends] incoming requests', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to list incoming requests');
  }
});

router.get('/requests/outgoing', async (req, res) => {
  try {
    const rows = await prisma.friendRequest.findMany({
      where: { fromUserId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, rows);
  } catch (e) {
    console.error('[friends] outgoing requests', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to list outgoing requests');
  }
});

router.post('/requests', async (req, res) => {
  const { toUserId } = req.body || {};
  if (!toUserId || typeof toUserId !== 'string' || !toUserId.trim()) {
    return fail(res, 400, 'INVALID_INPUT', 'toUserId is required');
  }
  const target = toUserId.trim();
  try {
    const result = await prisma.$transaction((tx) =>
      sendFriendRequestTx(tx, req.userId, target),
    );
    if (result.error) {
      const { status, code, message } = result.error;
      return fail(res, status, code, message);
    }
    return ok(res, result);
  } catch (e) {
    console.error('[friends] send request', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to send friend request');
  }
});

router.post('/requests/:requestId/accept', async (req, res) => {
  const { requestId } = req.params;
  if (!requestId) {
    return fail(res, 400, 'INVALID_INPUT', 'requestId is required');
  }
  try {
    const result = await prisma.$transaction((tx) =>
      acceptFriendRequestTx(tx, requestId, req.userId),
    );
    if (result.error) {
      const { status, code, message } = result.error;
      return fail(res, status, code, message);
    }
    return res.status(204).send();
  } catch (e) {
    console.error('[friends] accept request', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to accept friend request');
  }
});

router.delete('/requests/:requestId', async (req, res) => {
  const { requestId } = req.params;
  try {
    const result = await prisma.$transaction((tx) =>
      cancelOrDeclineRequestTx(tx, requestId, req.userId),
    );
    if (result.error) {
      const { status, code, message } = result.error;
      return fail(res, status, code, message);
    }
    return res.status(204).send();
  } catch (e) {
    console.error('[friends] cancel/decline request', e);
    return fail(
      res,
      500,
      'INTERNAL_ERROR',
      'Failed to cancel or decline friend request',
    );
  }
});

router.get('/', async (req, res) => {
  try {
    const rows = await prisma.friendship.findMany({
      where: {
        OR: [{ userLowId: req.userId }, { userHighId: req.userId }],
      },
      orderBy: { createdAt: 'desc' },
    });
    const friendIds = rows.map((r) =>
      r.userLowId === req.userId ? r.userHighId : r.userLowId,
    );
    const friends = friendIds.map((id) => toFriendDto(id));
    return ok(res, friends);
  } catch (e) {
    console.error('[friends] list friends', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to list friends');
  }
});

router.get('/:userId', async (req, res) => {
  const { userId: otherId } = req.params;
  if (!otherId || otherId === 'requests' || otherId === req.userId) {
    return fail(res, 400, 'INVALID_INPUT', 'Invalid user id');
  }
  try {
    const friendId = await getOtherUserIdInFriendship(req.userId, otherId);
    if (!friendId || friendId !== otherId) {
      return fail(res, 404, 'NOT_FOUND', 'Friend not found');
    }
    return ok(res, toFriendDto(friendId));
  } catch (e) {
    console.error('[friends] get friend', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to load friend');
  }
});

router.delete('/:userId', async (req, res) => {
  const { userId: friendUserId } = req.params;
  if (
    !friendUserId ||
    friendUserId === 'requests' ||
    friendUserId === req.userId
  ) {
    return fail(res, 400, 'INVALID_INPUT', 'Invalid user id');
  }
  try {
    const n = await removeFriendship(req.userId, friendUserId);
    if (n === 0) {
      return fail(res, 404, 'NOT_FOUND', 'Friendship not found');
    }
    return res.status(204).send();
  } catch (e) {
    console.error('[friends] remove friend', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to remove friend');
  }
});

module.exports = router;
