import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PatchProfileDto } from './dto/patch-profile.dto';
import { PrismaService } from '../prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateProfileForUser(userId: string) {
    const existing = await this.prisma.profile.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.profile.create({
      data: {
        userId,
        username: `user_${userId.slice(0, 8)}`,
        bio: null,
      },
    });
  }

  async updateProfileForUser(userId: string, dto: UpdateProfileDto) {
    await this.getOrCreateProfileForUser(userId);
    try {
      return await this.prisma.profile.update({
        where: { userId },
        data: {
          username: dto.name,
          bio: dto.description,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Username is already taken');
      }
      throw error;
    }
  }

  async patchProfileForUser(userId: string, dto: PatchProfileDto) {
    await this.getOrCreateProfileForUser(userId);
    if (dto.interests === undefined) {
      return this.prisma.profile.findUniqueOrThrow({ where: { userId } });
    }
    return this.prisma.profile.update({
      where: { userId },
      data: { interests: dto.interests as object },
    });
  }
}
