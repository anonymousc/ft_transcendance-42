import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { FortyTwoOAuthGuard } from './guards/fortytwo-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SignupDto, SigninDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private setAuthCookie(res: Response, token: string) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as any,
      path: '/',
    });
  }

  private setCsrfCookie(res: Response, token: string) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie('csrf_token', token, {
      httpOnly: false,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as any,
      path: '/',
    });
  }

  @Get('csrf')
  csrf(@Res({ passthrough: true }) res: Response) {
    const token = randomBytes(32).toString('hex');
    this.setCsrfCookie(res, token);
    return { csrfToken: token };
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signup(dto);
    this.setAuthCookie(res, result.accessToken);
    return result.user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() dto: SigninDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signin(dto);
    this.setAuthCookie(res, result.accessToken);
    return result.user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('csrf_token', { path: '/' });
    return { ok: true };
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.validateGoogleUser(req.user as any);
    const token = this.authService.generateJwt(user);
    this.setAuthCookie(res, token);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://frontend:5173';
    return res.redirect(`${frontendUrl}/oauth-success`);
  }

  @Get('42')
  @UseGuards(FortyTwoOAuthGuard)
  async fortyTwoAuth() {
    // Guard redirects to 42 Intra
  }

  @Get('42/callback')
  @UseGuards(FortyTwoOAuthGuard)
  async fortyTwoAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.validateFortyTwoUser(req.user as any);
    const token = this.authService.generateJwt(user);
    this.setAuthCookie(res, token);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://frontend:5173';
    return res.redirect(`${frontendUrl}/oauth-success`);
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

  /**
   * Token introspection endpoint.
   * Other microservices that cannot verify the JWT locally
   * call GET /auth/validate (Bearer token) to confirm validity.
   * Returns { valid: true, user: { id, email } } on success.
   */
  @Get('validate')
  @UseGuards(JwtAuthGuard)
  validate(@Req() req: Request) {
    const { id, email } = req.user as { id: string; email: string };
    return { valid: true, user: { id, email } };
  }

  /**
   * Returns a valid Google OAuth access token for the authenticated user (Calendar API).
   * Planner and other services forward the user's session cookie.
   */
  @Get('internal/google-token')
  @UseGuards(JwtAuthGuard)
  async internalGoogleToken(@Req() req: Request) {
    const { id } = req.user as { id: string };
    try {
      const accessToken = await this.authService.getValidGoogleAccessToken(id);
      return { ok: true, data: { accessToken } };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to get Google token';
      throw new HttpException(
        { ok: false, error: { message } },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
