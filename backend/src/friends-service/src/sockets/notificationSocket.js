const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const NOTIFICATION_WS_PORT = Number(process.env.NOTIFICATION_WS_PORT) || 8182;

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

function notificationPayload(n) {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    body: n.body,
    data: n.data ?? null,
    read: n.read,
    readAt:
      n.readAt instanceof Date ? n.readAt.toISOString() : n.readAt ?? null,
    archived: Boolean(n.archived),
    archivedAt:
      n.archivedAt instanceof Date
        ? n.archivedAt.toISOString()
        : n.archivedAt ?? null,
    createdAt:
      n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
  };
}

/**
 * Push a persisted notification to every connected socket for that user.
 * @param {import('@prisma/client').Notification} notification
 */
function notifyNewNotification(notification) {
  const userId = notification.userId;
  const body = JSON.stringify({
    type: 'notification',
    notification: notificationPayload(notification),
  });
  const set = socketsByUserId.get(userId);
  if (!set) return;
  for (const client of set) {
    if (client.readyState === WebSocket.OPEN) client.send(body);
  }
}

/**
 * @param {string} userId
 * @param {string} notificationId
 */
function notifyNotificationArchived(userId, notificationId) {
  const body = JSON.stringify({
    type: 'notification_archived',
    notificationId,
  });
  const set = socketsByUserId.get(userId);
  if (!set) return;
  for (const client of set) {
    if (client.readyState === WebSocket.OPEN) client.send(body);
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

const wss = new WebSocket.Server({ port: NOTIFICATION_WS_PORT });

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
      message:
        'Missing token: connect with ws://host:port/?token=JWT (NOTIFICATION_WS_PORT)',
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
  sendJson(ws, { type: 'ready', userId, channel: 'notifications' });

  ws.on('close', () => {
    removeUserSocket(userId, ws);
  });
});

wss.on('error', (err) => {
  console.error('[notification-ws] server error', err);
});

console.log(
  `Notification WebSocket listening on port ${NOTIFICATION_WS_PORT}`,
);

module.exports = { wss, notifyNewNotification, notifyNotificationArchived };
