import { Controller, Post, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
    constructor(private friendsService: FriendsService) {}

    @Post('request/:userId')
    sendRequest(@Param('userId') receiverId: string, @Req() req: Request) {
        const sender = req.user as { id: string };
        return this.friendsService.sendRequest(sender.id, receiverId);
    }

    @Get('requests')
    getPendingRequests(@Req() req: Request) {
        const user = req.user as { id: string };
        return this.friendsService.getPendingRequests(user.id);
    }

    @Patch('accept/:requestId')
    acceptRequest(@Param('requestId') requestId: string, @Req() req: Request) {
        const user = req.user as { id: string };
        return this.friendsService.acceptRequest(requestId, user.id);
    }

    @Patch('reject/:requestId')
    rejectRequest(@Param('requestId') requestId: string, @Req() req: Request) {
        const user = req.user as { id: string };
        return this.friendsService.rejectRequest(requestId, user.id);
    }
}
