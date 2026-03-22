import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async returnprofiles() {
    return this.prisma.profile.findMany();
  }

  async findone(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });
    if (!profile) throw new NotFoundException(`Profile with ID ${id} not found`);
    return profile;
  }

  async createprofile(dto: CreatProfileDto) {
    const newprofile = await this.prisma.profile.create({
      data: {
        userId: dto.name,
        username: dto.name,
        bio: dto.description,
      },
    });
    return newprofile;
  }

  async updateprofile(id: string, dto: UpdateProfileDto) {
    const existing = await this.prisma.profile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Profile with ID ${id} not found`);

    return this.prisma.profile.update({
      where: { id },
      data: {
        username: dto.name,
        bio: dto.description,
      },
    });
  }

  async removeprofile(id: string) {
    const matchingprofile = await this.prisma.profile.findUnique({ where: { id } });
    if (!matchingprofile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    await this.prisma.profile.delete({ where: { id } });
  }
}
