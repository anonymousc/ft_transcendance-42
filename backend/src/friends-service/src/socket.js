const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const {
  createMessage,
  isParticipant,
  getParticipantUserIds,
} = require('./services/chatService');

const WS_PORT = Number(process.env.WS_PORT) || 8181;

/** @type {Map<string, Set<WebSocket>>} */
const socketsByUserId = new Map();

function addUserSocket(userId, ws) {
  let set = socketsByUserId.get(userId);
  if (!set) {
    set = new Set();
    socketsByUserId.set(userId, set);
  }
  set.add(ws);
}

function removeUserSocket(userId, ws) {
  const set = socketsByUserId.get(userId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) socketsByUserId.delete(userId);
}

function sendJson(ws, obj) {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(obj));
}

/** Wire format aligned with frontend `WsServerEnvelope` (type `message`). */
function chatMessageEnvelope(message) {
  const createdAt =
    message.createdAt instanceof Date
      ? message.createdAt.toISOString()
      : message.createdAt;
  const now = new Date().toISOString();
  return JSON.stringify({
    type: 'message',
    payload: {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      status: 'sent',
      timestamp: createdAt,
    },
    timestamp: now,
  });
}

/**
 * Push a persisted message to every connected socket of each conversation participant.
 * @param {import('@prisma/client').Message} message
 */
async function notifyNewChatMessage(message) {
  const userIds = await getParticipantUserIds(message.conversationId);
  const body = chatMessageEnvelope(message);
  for (const uid of userIds) {
    const set = socketsByUserId.get(uid);
    if (!set) continue;
    for (const client of set) {
      if (client.readyState === WebSocket.OPEN) client.send(body);
    }
  }
}

function extractToken(req) {
  try {
    const u = new URL(req.url || '/', 'http://localhost');
    return u.searchParams.get('token');
  } catch (_) {
    return null;
  }
}

const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws, req) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    sendJson(ws, {
      type: 'error',
      code: 'INTERNAL_ERROR',
      message: 'Server misconfiguration',
    });
    ws.close();
    return;
  }

  const token = extractToken(req);
  if (!token) {
    sendJson(ws, {
      type: 'error',
      code: 'UNAUTHORIZED',
      message: 'Missing token: connect with ws://host:port/?token=JWT',
    });
    ws.close();
    return;
  }

  let userId;
  try {
    const payload = jwt.verify(token, secret);
    userId = payload.sub;
    if (!userId || typeof userId !== 'string') {
      throw new Error('invalid sub');
    }
  } catch (e) {
    const expired = e.name === 'TokenExpiredError';
    sendJson(ws, {
      type: 'error',
      code: expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      message: expired ? 'Access token has expired' : 'Invalid access token',
    });
    ws.close();
    return;
  }

  addUserSocket(userId, ws);
  sendJson(ws, { type: 'ready', userId });

  ws.on('message', async (raw) => {
    let msg;
    try {
      const text = typeof raw === 'string' ? raw : raw.toString();
      msg = JSON.parse(text);
    } catch (_) {
      sendJson(ws, { type: 'error', code: 'INVALID_JSON', message: 'Expected JSON' });
      return;
    }

    if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') {
      sendJson(ws, { type: 'error', code: 'INVALID_MESSAGE', message: 'Missing type' });
      return;
    }

    try {
      if (msg.type === 'join') {
        const cid =
          typeof msg.conversationId === 'string' ? msg.conversationId.trim() : '';
        if (!cid) {
          sendJson(ws, {
            type: 'error',
            code: 'INVALID_INPUT',
            message: 'conversationId required',
          });
          return;
        }
        const ok = await isParticipant(userId, cid);
        if (!ok) {
          sendJson(ws, { type: 'error', code: 'NOT_FOUND', message: 'Conversation not found' });
          return;
        }
        sendJson(ws, { type: 'joined', conversationId: cid });
        return;
      }

      if (msg.type === 'message') {
        const cid =
          typeof msg.conversationId === 'string' ? msg.conversationId.trim() : '';
        if (!cid) {
          sendJson(ws, {
            type: 'error',
            code: 'INVALID_INPUT',
            message: 'conversationId required',
          });
          return;
        }
        const result = await createMessage(cid, userId, msg.content);
        if (result.error) {
          sendJson(ws, {
            type: 'error',
            code: result.error.code || 'ERROR',
            message: result.error.message,
          });
          return;
        }
        const tempId =
          typeof msg.tempId === 'string' && msg.tempId.trim()
            ? msg.tempId.trim()
            : undefined;
        if (tempId) {
          sendJson(ws, {
            type: 'message_ack',
            payload: {
              tempId,
              id: result.message.id,
              status: 'sent',
            },
            timestamp: new Date().toISOString(),
          });
        }
        await notifyNewChatMessage(result.message);
        return;
      }

      if (msg.type === 'typing') {
        const cid =
          typeof msg.conversationId === 'string' ? msg.conversationId.trim() : '';
        if (!cid) {
          sendJson(ws, {
            type: 'error',
            code: 'INVALID_INPUT',
            message: 'conversationId required',
          });
          return;
        }
        const ok = await isParticipant(userId, cid);
        if (!ok) {
          sendJson(ws, { type: 'error', code: 'NOT_FOUND', message: 'Conversation not found' });
          return;
        }
        const typing = Boolean(msg.typing);
        const participants = await getParticipantUserIds(cid);
        const body = JSON.stringify({
          type: 'typing',
          conversationId: cid,
          userId,
          typing,
        });
        for (const uid of participants) {
          if (uid === userId) continue;
          const set = socketsByUserId.get(uid);
          if (!set) continue;
          for (const client of set) {
            if (client.readyState === WebSocket.OPEN) client.send(body);
          }
        }
        return;
      }

      sendJson(ws, {
        type: 'error',
        code: 'UNKNOWN_TYPE',
        message: `Unknown type: ${msg.type}`,
      });
    } catch (err) {
      console.error('[ws] message handler', err);
      sendJson(ws, { type: 'error', code: 'INTERNAL_ERROR', message: 'Server error' });
    }
  });

  ws.on('close', () => {
    removeUserSocket(userId, ws);
  });
});

wss.on('error', (err) => {
  console.error('[ws] server error', err);
});

console.log(`WebSocket server listening on port ${WS_PORT}`);

module.exports = { wss, notifyNewChatMessage };
