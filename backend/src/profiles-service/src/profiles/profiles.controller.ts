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
  UnauthorizedException,
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

  private resolveUserId(req: Request): string {
    const jwtUserId = (req.user as { id?: string } | undefined)?.id;
    if (jwtUserId) return jwtUserId;

    const headerUserId = req.header('x-user-id')?.trim();
    if (headerUserId) return headerUserId;

    throw new UnauthorizedException('User identity is required');
  }

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
  getMe(@Req() req: Request) {
    return this.profilesservice.getOrCreateProfileForUser(this.resolveUserId(req));
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req: Request, @Body(ValidationPipe) updateprofiledto: UpdateProfileDto) {
    const user = req.user as { id: string };
    return this.profilesservice.updateProfileForUser(user.id, updateprofiledto);
  }

  @Patch('me')
  patchMe(@Req() req: Request, @Body(ValidationPipe) dto: PatchProfileDto) {
    return this.profilesservice.patchProfileForUser(this.resolveUserId(req), dto);
  }
}
