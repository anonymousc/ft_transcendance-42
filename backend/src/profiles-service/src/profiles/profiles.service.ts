import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PatchProfileDto } from './dto/patch-profile.dto';
import { PrismaService } from '../prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  private normalizeInterests(raw: any) {
    const base = { hobbies: [], activities: [], foods: [], topics: [], travelStyle: [] };
    if (!raw || typeof raw !== 'object') return base;
    return {
      hobbies: Array.isArray(raw.hobbies) ? raw.hobbies : base.hobbies,
      activities: Array.isArray(raw.activities) ? raw.activities : base.activities,
      foods: Array.isArray(raw.foods) ? raw.foods : base.foods,
      topics: Array.isArray(raw.topics) ? raw.topics : base.topics,
      travelStyle: Array.isArray(raw.travelStyle) ? raw.travelStyle : base.travelStyle,
    };
  }

  async getOrCreateProfileForUser(userId: string) {
    const existing = await this.prisma.profile.findUnique({ where: { userId } });
    if (existing) return { ...existing, interests: this.normalizeInterests(existing.interests) };
    const created = await this.prisma.profile.create({
      data: {
        userId,
        username: `user_${userId.slice(0, 8)}`,
        bio: null,
      },
    });
    return { ...created, interests: this.normalizeInterests(created.interests) };
  }

  async updateProfileForUser(userId: string, dto: UpdateProfileDto) {
    await this.getOrCreateProfileForUser(userId);
    try {
      const updated = await this.prisma.profile.update({
        where: { userId },
        data: {
          username: dto.name,
          bio: dto.description,
        },
      });
      return { ...updated, interests: this.normalizeInterests(updated.interests) };
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
      const row = await this.prisma.profile.findUniqueOrThrow({ where: { userId } });
      return { ...row, interests: this.normalizeInterests(row.interests) };
    }
    const updated = await this.prisma.profile.update({
      where: { userId },
      data: { interests: dto.interests as object },
    });
    return { ...updated, interests: this.normalizeInterests(updated.interests) };
  }

  async searchProfilesForUser(currentUserId: string, q: string, limit: number) {
    const take = Math.min(Math.max(limit, 1), 25);
    const rows = await this.prisma.profile.findMany({
      where: {
        NOT: { userId: currentUserId },
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
        ],
      },
      take,
      orderBy: { username: 'asc' },
      select: {
        userId: true,
        username: true,
        displayName: true,
        avatar: true,
        interests: true,
      },
    });
    return rows.map((r) => ({ ...r, interests: this.normalizeInterests(r.interests) }));
  }
}
