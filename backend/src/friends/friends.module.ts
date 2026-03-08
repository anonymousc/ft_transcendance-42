import { Module } from '@nestjs/common';

@Module({})
export class FriendsModule {}

// POST /friends/request/:userId - send friend request
// POST /friends/accept/:requestId - accept request
// POST /friends/reject/:requestId - reject request
// DELETE /friends/:friendshipId - remove friend
// GET /friends - list friends
// GET /friends/requests - list incoming friend requests