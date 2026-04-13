const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getOrCreateDmConversation,
  listConversationsForUser,
  listMessages,
  createMessage,
} = require('../services/chatService');
const { notifyNewChatMessage } = require('../sockets/chatSocket');

const router = express.Router();

router.use(authMiddleware);

function ok(res, data) {
  return res.json({ ok: true, data });
}

function fail(res, status, code, message) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

/** List conversations the current user participates in */
router.get('/conversations', async (req, res) => {
  try {
    const data = await listConversationsForUser(req.userId);
    return ok(res, data);
  } catch (e) {
    console.error('[chat] list conversations', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to list conversations');
  }
});

/**
 * Open or create a 1:1 conversation with a friend.
 * Body: { withUserId: string }
 */
router.post('/conversations', async (req, res) => {
  const { withUserId } = req.body || {};
  if (!withUserId || typeof withUserId !== 'string' || !withUserId.trim()) {
    return fail(res, 400, 'INVALID_INPUT', 'withUserId is required');
  }
  const other = withUserId.trim();
  if (other === req.userId) {
    return fail(res, 400, 'INVALID_INPUT', 'Cannot open a conversation with yourself');
  }
  try {
    const result = await getOrCreateDmConversation(req.userId, other);
    if (result.error) {
      const { status, code, message } = result.error;
      return fail(res, status, code, message);
    }
    const { conversation } = result;
    return ok(res, {
      id: conversation.id,
      createdAt: conversation.createdAt,
      peerUserId: other,
      participantCount: conversation.participants.length,
    });
  } catch (e) {
    console.error('[chat] open conversation', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to open conversation');
  }
});

/** List messages in a conversation (newest page: omit beforeMessageId; older: pass beforeMessageId) */
router.get('/conversations/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params;
  const beforeMessageId =
    typeof req.query.before === 'string' && req.query.before.trim()
      ? req.query.before.trim()
      : undefined;
  const limit = req.query.limit;
  try {
    const result = await listMessages(conversationId, req.userId, {
      beforeMessageId,
      limit: limit !== undefined ? Number(limit) : undefined,
    });
    if (result.error) {
      const { status, code, message } = result.error;
      return fail(res, status, code, message);
    }
    return ok(res, {
      messages: result.messages,
      hasMore: result.hasMore,
    });
  } catch (e) {
    console.error('[chat] list messages', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to list messages');
  }
});

/** Post a message; participants receive the same payload over WebSocket */
router.post('/conversations/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body || {};
  try {
    const result = await createMessage(conversationId, req.userId, content);
    if (result.error) {
      const { status, code, message } = result.error;
      return fail(res, status, code, message);
    }
    notifyNewChatMessage(result.message).catch((err) =>
      console.error('[chat] ws notify', err),
    );
    return ok(res, result.message);
  } catch (e) {
    console.error('[chat] create message', e);
    return fail(res, 500, 'INTERNAL_ERROR', 'Failed to send message');
  }
});

module.exports = router;
