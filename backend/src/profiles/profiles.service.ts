import { Injectable, NotFoundException } from '@nestjs/common';
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
                username: dto.username,       
                displayName: dto.displayName, 
                bio: dto.bio,                 
                avatar: dto.avatar,
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
