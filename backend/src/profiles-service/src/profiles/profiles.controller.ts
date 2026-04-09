import {
  Controller,
  Get,
  Body,
  Put,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private profilesservice: ProfilesService) {}

  @Get('me')
  getMe(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.profilesservice.getOrCreateProfileForUser(user.id);
  }

  @Put('me')
  updateMe(@Req() req: Request, @Body(ValidationPipe) updateprofiledto: UpdateProfileDto) {
    const user = req.user as { id: string };
    return this.profilesservice.updateProfileForUser(user.id, updateprofiledto);
  }
}
