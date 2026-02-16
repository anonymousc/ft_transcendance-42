import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreatProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
    private profiles = [
        {
            id : randomUUID(), 
            name : "nigga",
            description : "zinji"
        },
        {
            id : randomUUID(),
            name : "3azzi",
            description : "zinji tana"
        },
        {
            id : randomUUID(),
            name : "wigga",
            description : "white nigga"
        }
    ]

    returnprofiles()
    {
        return this.profiles;
    }
    
    findone(id : string)
    {
        return this.profiles.find((profiles) => profiles.id === id);
    }

    createprofile(dto : CreatProfileDto)
    {
        const newprofile = {
            id : randomUUID(),
            ...dto
        };
        this.profiles.push(newprofile);
        return this.profiles;
    }

    updateprofile(id : string , profile : UpdateProfileDto)
    {
        let profiletoupdate = this.profiles.find((profiles) => profiles.id === id);
        if (!profiletoupdate)
            return {};
        profiletoupdate.name = profile.name;
        profiletoupdate.description = profile.description;
        return profiletoupdate;
    }
}
