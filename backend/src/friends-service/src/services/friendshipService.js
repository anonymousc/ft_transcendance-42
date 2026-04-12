const prisma = require('../lib/prisma');
const { sortedPair } = require('../utils/friendship');

async function friendshipPairExists(tx, userIdA, userIdB) {
  const [low, high] = sortedPair(userIdA, userIdB);
  const row = await tx.friendship.findUnique({
    where: {
      userLowId_userHighId: { userLowId: low, userHighId: high },
    },
  });
  return !!row;
}

/**
 * @param {string} userId
 * @param {string} otherUserId
 */
async function getOtherUserIdInFriendship(userId, otherUserId) {
  const [low, high] = sortedPair(userId, otherUserId);
  const row = await prisma.friendship.findUnique({
    where: {
      userLowId_userHighId: { userLowId: low, userHighId: high },
    },
  });
  if (!row) return null;
  return row.userLowId === userId ? row.userHighId : row.userLowId;
}

/**
 * @param {import('@prisma/client').PrismaClient} tx
 */
async function sendFriendRequestTx(tx, fromUserId, toUserId) {
  if (fromUserId === toUserId) {
    return { error: { status: 400, code: 'INVALID_INPUT', message: 'Cannot send a friend request to yourself' } };
  }

  const alreadyFriends = await friendshipPairExists(tx, fromUserId, toUserId);
  if (alreadyFriends) {
    return { error: { status: 409, code: 'ALREADY_FRIENDS', message: 'You are already friends with this user' } };
  }

  const reverse = await tx.friendRequest.findUnique({
    where: {
      fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId },
    },
  });

  if (reverse) {
    const [low, high] = sortedPair(fromUserId, toUserId);
    await tx.friendship.create({
      data: { userLowId: low, userHighId: high },
    });
    await tx.friendRequest.deleteMany({
      where: {
        OR: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      },
    });
    return { autoAccepted: true, friendship: { userLowId: low, userHighId: high } };
  }

  const existing = await tx.friendRequest.findUnique({
    where: {
      fromUserId_toUserId: { fromUserId, toUserId },
    },
  });
  if (existing) {
    return { error: { status: 409, code: 'REQUEST_EXISTS', message: 'A pending friend request already exists' } };
  }

  const request = await tx.friendRequest.create({
    data: { fromUserId, toUserId },
  });
  return { autoAccepted: false, request };
}

/**
 * @param {import('@prisma/client').PrismaClient} tx
 */
async function acceptFriendRequestTx(tx, requestId, recipientUserId) {
  const request = await tx.friendRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    return { error: { status: 404, code: 'NOT_FOUND', message: 'Friend request not found' } };
  }
  if (request.toUserId !== recipientUserId) {
    return { error: { status: 403, code: 'FORBIDDEN', message: 'You cannot accept this friend request' } };
  }

  const [low, high] = sortedPair(request.fromUserId, request.toUserId);
  await tx.friendship.create({
    data: { userLowId: low, userHighId: high },
  });
  await tx.friendRequest.delete({ where: { id: requestId } });

  const reverse = await tx.friendRequest.findFirst({
    where: { fromUserId: request.toUserId, toUserId: request.fromUserId },
  });
  if (reverse) {
    await tx.friendRequest.delete({ where: { id: reverse.id } });
  }

  return { ok: true };
}

/**
 * @param {import('@prisma/client').PrismaClient} tx
 */
async function cancelOrDeclineRequestTx(tx, requestId, userId) {
  const request = await tx.friendRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    return { error: { status: 404, code: 'NOT_FOUND', message: 'Friend request not found' } };
  }
  if (request.fromUserId !== userId && request.toUserId !== userId) {
    return { error: { status: 403, code: 'FORBIDDEN', message: 'You cannot modify this friend request' } };
  }
  await tx.friendRequest.delete({ where: { id: requestId } });
  return { ok: true };
}

async function removeFriendship(userId, friendUserId) {
  const [low, high] = sortedPair(userId, friendUserId);
  const result = await prisma.friendship.deleteMany({
    where: { userLowId: low, userHighId: high },
  });
  return result.count;
}

module.exports = {
  getOtherUserIdInFriendship,
  sendFriendRequestTx,
  acceptFriendRequestTx,
  cancelOrDeclineRequestTx,
  removeFriendship,
};
