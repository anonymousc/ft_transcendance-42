import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FriendsService {
    constructor(private prisma: PrismaService) {}

    async sendRequest(senderId: string, receiverId: string) {
        // Can't send request to yourself
        if (senderId === receiverId) {
            throw new BadRequestException("You can't send a friend request to yourself");
        }

        // Check if receiver exists
        const receiver = await this.prisma.user.findUnique({
            where: { id: receiverId },
        });
        if (!receiver) {
            throw new NotFoundException('User not found');
        }

        // Check if a friendship already exists (in either direction)
        const existingFriendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
        });

        if (existingFriendship) {
            if (existingFriendship.status === 'PENDING') {
                throw new ConflictException('Friend request already pending');
            }
            if (existingFriendship.status === 'ACCEPTED') {
                throw new ConflictException('You are already friends');
            }
            if (existingFriendship.status === 'BLOCKED') {
                throw new BadRequestException('Cannot send request to this user');
            }
        }

        // Create the friend request
        const friendship = await this.prisma.friendship.create({
            data: {
                senderId: senderId,
                receiverId: receiverId,
                status: 'PENDING',
            },
            include: {
                receiver: {
                    select: { id: true, email: true, profile: true },
                },
            },
        });

        return {
            message: 'Friend request sent',
            friendship,
        };
    }

    async getPendingRequests(userId: string) {
        const requests = await this.prisma.friendship.findMany({
            where: {
                receiverId: userId,      // Requests sent TO this user
                status: 'PENDING',       // Only pending ones
            },
            include: {
                sender: {
                    select: { id: true, email: true, profile: true },  // Who sent it
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return requests;
    }

    async acceptRequest(requestId: string, userId: string) {
        const friendship = await this.prisma.friendship.findUnique({
            where: { id: requestId },
        });

        if (!friendship) {
            throw new NotFoundException('Friend request not found');
        }

        // Only the receiver can accept
        if (friendship.receiverId !== userId) {
            throw new BadRequestException('You can only accept requests sent to you');
        }

        if (friendship.status !== 'PENDING') {
            throw new BadRequestException('This request is no longer pending');
        }

        // Update status to ACCEPTED
        const updated = await this.prisma.friendship.update({
            where: { id: requestId },
            data: { status: 'ACCEPTED' },
            include: {
                sender: { select: { id: true, email: true, profile: true } },
                receiver: { select: { id: true, email: true, profile: true } },
            },
        });

        return {
            message: 'Friend request accepted',
            friendship: updated,
        };
    }


    async rejectRequest(requestId: string, userId: string) {
        const friendship = await this.prisma.friendship.findUnique({
            where: { id: requestId },
        });

        if (!friendship) {
            throw new NotFoundException('Friend request not found');
        }

        // Only the receiver can reject
        if (friendship.receiverId !== userId) {
            throw new BadRequestException('You can only reject requests sent to you');
        }

        if (friendship.status !== 'PENDING') {
            throw new BadRequestException('This request is no longer pending');
        }

        // Delete the request
        await this.prisma.friendship.delete({
            where: { id: requestId },
        });

        return { message: 'Friend request rejected' };
    }
}
