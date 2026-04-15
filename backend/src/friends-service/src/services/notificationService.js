const prisma = require('../lib/prisma');
const {
  notifyNewNotification,
  notifyNotificationArchived,
} = require('../sockets/notificationSocket');
const { normalizeJsonData } = require('../utils/notifications');

async function listNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId, archived: false },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}

async function readNotification(userId, notificationId) {
  if (!notificationId || typeof notificationId !== 'string' || !notificationId.trim()) {
    return {
      error: { status: 400, code: 'INVALID_INPUT', message: 'id is required' },
    };
  }
  const id = notificationId.trim();
  const now = new Date();
  const result = await prisma.notification.updateMany({
    where: { id, userId, archived: false },
    data: { read: true, readAt: now },
  });
  if (result.count === 0) {
    return {
      error: {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Notification not found',
      },
    };
  }
  const notification = await prisma.notification.findUnique({ where: { id } });
  return { notification };
}

async function readAllNotifications(userId) {
  const now = new Date();
  const result = await prisma.notification.updateMany({
    where: { userId, read: false, archived: false },
    data: { read: true, readAt: now },
  });
  return { count: result.count };
}

async function archiveNotification(userId, notificationId) {
  if (!notificationId || typeof notificationId !== 'string' || !notificationId.trim()) {
    return {
      error: { status: 400, code: 'INVALID_INPUT', message: 'id is required' },
    };
  }
  const id = notificationId.trim();
  const now = new Date();
  const result = await prisma.notification.updateMany({
    where: { id, userId, archived: false },
    data: { archived: true, archivedAt: now },
  });
  if (result.count === 0) {
    return {
      error: {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Notification not found or already archived',
      },
    };
  }
  const notification = await prisma.notification.findUnique({ where: { id } });
  try {
    notifyNotificationArchived(userId, id);
  } catch (err) {
    console.error('[notifications] ws archive push', err);
  }
  return { notification };
}

async function createNotification(userId, type, title, body, data) {
  if (!type || typeof type !== 'string' || !type.trim()) {
    return {
      error: { status: 400, code: 'INVALID_INPUT', message: 'type is required' },
    };
  }

  let jsonData;
  try {
    jsonData = normalizeJsonData(data);
  } catch (e) {
    const msg =
      e.message === 'INVALID_DATA_JSON'
        ? 'data must be valid JSON when sent as a string'
        : 'data must be a JSON object, array, or parseable JSON string';
    return { error: { status: 400, code: 'INVALID_INPUT', message: msg } };
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      type: type.trim(),
      title: title != null && String(title).trim() ? String(title).trim() : null,
      body: body != null && String(body).trim() ? String(body).trim() : null,
      ...(jsonData !== undefined ? { data: jsonData } : {}),
    },
  });

  try {
    notifyNewNotification(notification);
  } catch (err) {
    console.error('[notifications] ws push', err);
  }

  return { notification };
}

function notifyUser(userId, type, title, body, data) {
  void createNotification(userId, type, title, body, data).then((r) => {
    if (r.error) {
      console.error('[notifications] notifyUser', r.error.code, r.error.message);
    }
  });
}

module.exports = {
  listNotifications,
  readNotification,
  readAllNotifications,
  archiveNotification,
  createNotification,
  notifyUser,
};
