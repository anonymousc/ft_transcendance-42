import { Controller, Get, Post, Body, Req, Res, UseGuards, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { FortyTwoOAuthGuard } from './guards/fortytwo-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SignupDto, SigninDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { FortyTwoAuthService } from './services/fortytwo-auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private fortyTwoAuthService: FortyTwoAuthService,
    private configService: ConfigService,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.validateGoogleUser(req.user as any);
    const token = this.authService.generateJwt(user);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/oauth-success?token=${token}`);
  }

  @Get('42')
  @UseGuards(FortyTwoOAuthGuard)
  async fortyTwoAuth() {
  }
  @Get('42/callback')
  @UseGuards(FortyTwoOAuthGuard)
  async fortyTwoAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = await this.fortyTwoAuthService.validateFortyTwoUser(req.user as any);
    const token = this.authService.generateJwt(user);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/oauth-success?token=${token}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    const user = req.user as { id: string };
    const profile = await this.authService.getMe(user.id);
    if (!profile) {
      throw new UnauthorizedException('User not found');
    }
    return profile;
  }
}
