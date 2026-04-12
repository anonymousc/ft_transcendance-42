import {
  Controller,
  Get,
  Body,
  Put,
  Patch,
  Req,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PatchProfileDto } from './dto/patch-profile.dto';
import { SearchProfilesQueryDto } from './dto/search-profiles-query.dto';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('profiles')
export class ProfilesController {
  constructor(private profilesservice: ProfilesService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  searchProfiles(@Req() req: Request, @Query() query: SearchProfilesQueryDto) {
    const user = req.user as { id: string };
    const limit = query.limit ?? 20;
    return this.profilesservice.searchProfilesForUser(user.id, query.q, limit);
  }

  @Get('internal/:userId')
  getInternalProfile(@Param('userId') userId: string) {
    return this.profilesservice.getOrCreateProfileForUser(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.profilesservice.getOrCreateProfileForUser(user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req: Request, @Body(ValidationPipe) updateprofiledto: UpdateProfileDto) {
    const user = req.user as { id: string };
    return this.profilesservice.updateProfileForUser(user.id, updateprofiledto);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  patchMe(@Req() req: Request, @Body(ValidationPipe) dto: PatchProfileDto) {
    const user = req.user as { id: string };
    return this.profilesservice.patchProfileForUser(user.id, dto);
  }
}
