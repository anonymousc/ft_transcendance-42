import { Controller, Get, Param, Body, Put, Delete, HttpCode, HttpStatus} from '@nestjs/common';
import { UpdateProfileDto }  from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController 
{
    constructor (private profilesservice : ProfilesService)
    {

    }
    @Get()
    findprofiles()
    {
        return this.profilesservice.returnprofiles();
    }

    @Get(':id')
    findOne(@Param('id') id: string)
    {
        return this.profilesservice.findone(id);
    }

    @Put(':id')
    updateProfile(@Param('id') id : string, @Body() updateprofiledto : UpdateProfileDto)
    {
        return this.profilesservice.updateprofile(id, updateprofiledto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id : string)
    {
            return this.profilesservice.removeprofile(id);
    }

}