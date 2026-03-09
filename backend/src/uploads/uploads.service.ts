import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UploadsService {
    constructor(private prisma: PrismaService) {}

    async uploadAvatar(file: Express.Multer.File, userId: string)
    {
        const avatarPath = `/uploads/avatars/${file.filename}`;

        const existingProfile = await this.prisma.profile.findUnique({
            where: { userId: userId },
        });

        if (!existingProfile) {
            throw new NotFoundException(
                `Profile not found for user ${userId}. ` +
                `Make sure you signed up properly (profile is created during signup).`
            );
        }

        const updatedProfile = await this.prisma.profile.update({
            where: { userId: userId },
            data: { avatar: avatarPath },
        });

        return {
            message: 'Avatar uploaded successfully',
            avatarUrl: avatarPath,
            profile: updatedProfile,
        };
    }
}
