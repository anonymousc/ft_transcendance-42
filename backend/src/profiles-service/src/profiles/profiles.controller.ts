import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { CreatProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private profilesservice: ProfilesService) {}

  @Get()
  findprofiles() {
    return this.profilesservice.returnprofiles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profilesservice.findone(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProfile(@Body(ValidationPipe) creatProfileDto: CreatProfileDto) {
    return this.profilesservice.createprofile(creatProfileDto);
  }

  @Put(':id')
  updateProfile(
    @Param('id') id: string,
    @Body(ValidationPipe) updateprofiledto: UpdateProfileDto,
  ) {
    return this.profilesservice.updateprofile(id, updateprofiledto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.profilesservice.removeprofile(id);
  }
}
