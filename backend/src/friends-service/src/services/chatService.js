const prisma = require('../lib/prisma');
const { getOtherUserIdInFriendship } = require('./friendshipService');
const { notifyUser } = require('./notificationService');
const { NOTIFY_TYPES } = require('../utils/notifications');

const MAX_MESSAGE_LENGTH = 8000;
const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 100;

/**
 * @param {string} userId
 * @param {string} conversationId
 */
async function isParticipant(userId, conversationId) {
  const row = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
  });
  return !!row;
}

/**
 * @param {string} conversationId
 * @returns {Promise<string[]>}
 */
async function getParticipantUserIds(conversationId) {
  const rows = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  return rows.map((r) => r.userId);
}

/**
 * DM: exactly two participants, both userId and otherUserId.
 * @param {import('@prisma/client').PrismaClient} tx
 */
async function findDmBetweenTx(tx, userId, otherUserId) {
  const candidates = await tx.conversation.findMany({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    include: { participants: true },
  });
  return (
    candidates.find((c) => c.participants.length === 2) ?? null
  );
}

/**
 * @param {string} userId
 * @param {string} otherUserId must be a friend
 */
async function getOrCreateDmConversation(userId, otherUserId) {
  const friendId = await getOtherUserIdInFriendship(userId, otherUserId);
  if (!friendId || friendId !== otherUserId) {
    return { error: { status: 403, code: 'NOT_FRIEND', message: 'You can only chat with friends' } };
  }

  return prisma.$transaction(async (tx) => {
    const existing = await findDmBetweenTx(tx, userId, otherUserId);
    if (existing) {
      return { conversation: existing };
    }
    const conversation = await tx.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: { participants: true },
    });
    return { conversation };
  });
}

/**
 * @param {string} userId
 */
async function listConversationsForUser(userId) {
  const rows = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const items = rows.map((c) => {
    const peer =
      c.participants.length === 2
        ? c.participants.find((p) => p.userId !== userId)?.userId ?? null
        : null;
    const last = c.messages[0];
    return {
      id: c.id,
      createdAt: c.createdAt,
      peerUserId: peer,
      participantCount: c.participants.length,
      lastMessage: last
        ? {
            id: last.id,
            senderId: last.senderId,
            content: last.content,
            createdAt: last.createdAt,
          }
        : null,
    };
  });

  items.sort((a, b) => {
    const ta = a.lastMessage?.createdAt ?? a.createdAt;
    const tb = b.lastMessage?.createdAt ?? b.createdAt;
    return new Date(tb) - new Date(ta);
  });

  return items;
}

/**
 * @param {string} conversationId
 * @param {string} userId
 * @param {{ limit?: number, beforeMessageId?: string }} opts
 */
async function listMessages(conversationId, userId, opts = {}) {
  const participant = await isParticipant(userId, conversationId);
  if (!participant) {
    return { error: { status: 404, code: 'NOT_FOUND', message: 'Conversation not found' } };
  }

  let limit = Number(opts.limit);
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_MESSAGE_LIMIT;
  limit = Math.min(Math.floor(limit), MAX_MESSAGE_LIMIT);

  let cursor = null;
  if (opts.beforeMessageId) {
    cursor = await prisma.message.findFirst({
      where: { id: opts.beforeMessageId, conversationId },
    });
    if (!cursor) {
      return { error: { status: 400, code: 'INVALID_CURSOR', message: 'Invalid beforeMessageId' } };
    }
  }

  const where = {
    conversationId,
    ...(cursor
      ? {
          OR: [
            { createdAt: { lt: cursor.createdAt } },
            {
              AND: [
                { createdAt: cursor.createdAt },
                { id: { lt: cursor.id } },
              ],
            },
          ],
        }
      : {}),
  };

  const messages = await prisma.message.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit,
  });

  return {
    messages: messages.slice().reverse(),
    hasMore: messages.length === limit,
  };
}

/**
 * @param {string} conversationId
 * @param {string} senderId
 * @param {string} content
 */
async function createMessage(conversationId, senderId, content) {
  const participant = await isParticipant(senderId, conversationId);
  if (!participant) {
    return { error: { status: 404, code: 'NOT_FOUND', message: 'Conversation not found' } };
  }

  const text = typeof content === 'string' ? content.trim() : '';
  if (!text) {
    return { error: { status: 400, code: 'INVALID_INPUT', message: 'content is required' } };
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    return {
      error: {
        status: 400,
        code: 'INVALID_INPUT',
        message: `content must be at most ${MAX_MESSAGE_LENGTH} characters`,
      },
    };
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content: text,
    },
  });

  const recipients = await getParticipantUserIds(conversationId);
  const preview = text.length > 120 ? `${text.slice(0, 120)}…` : text;
  for (const uid of recipients) {
    if (uid === senderId) continue;
    notifyUser(
      uid,
      NOTIFY_TYPES.CHAT_MESSAGE,
      'New message',
      preview,
      {
        conversationId,
        messageId: message.id,
        senderId,
      },
    );
  }

  return { message };
}

module.exports = {
  getOrCreateDmConversation,
  listConversationsForUser,
  listMessages,
  createMessage,
  isParticipant,
  getParticipantUserIds,
  MAX_MESSAGE_LENGTH,
};
