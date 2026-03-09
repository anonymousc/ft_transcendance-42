import { Injectable, NotFoundException } from '@nestjs/common';
// Removed: import { randomUUID } from 'crypto'; - Prisma auto-generates IDs with @default(cuid())
import { CreatProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProfilesService {
   
    constructor(private prisma: PrismaService) {}


    async returnprofiles()
    {
        return this.prisma.profile.findMany();
    }
    
    async findone(id : string)
    {
        const profile = await this.prisma.profile.findUnique({
            where: { id: id },
        });
        if (!profile)
            throw new NotFoundException(`Profile with ID ${id} not found`);
        return profile;
    }

    async createprofile(dto : CreatProfileDto)
    {
        const newprofile = await this.prisma.profile.create({
            data: {
                userId: dto.name,          // TEMPORARY: This needs to come from authenticated user
                username: dto.name,        // Map 'name' to 'username' 
                bio: dto.description,      // Map 'description' to 'bio'
            },
        });
        return newprofile;
    }

    async updateprofile(id : string , dto : UpdateProfileDto)
    {
        const existing = await this.prisma.profile.findUnique({
            where: { id },
        });
        if (!existing)
            throw new NotFoundException(`Profile with ID ${id} not found`);

        const updatedProfile = await this.prisma.profile.update({
            where: { id: id },
            data: {
                username: dto.name,
                bio: dto.description,
            },
        });
        return updatedProfile;
    }

    async removeprofile(id : string)
    {
        const matchingprofile = await this.prisma.profile.findUnique({
            where: { id : id },
        });
        if (!matchingprofile)
        {
            throw new NotFoundException(`Profile with ID ${id} not found`);
        }
        await this.prisma.profile.delete({
            where: { id: id },
        });
    }
}
