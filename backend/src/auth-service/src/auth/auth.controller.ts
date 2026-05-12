import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { SignupDto, SigninDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
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

  private setCsrfCookie(res: Response) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const csrfToken = randomBytes(32).toString('hex');
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as any,
      path: '/',
    });
  }

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(dto);
    this.setAuthCookie(res, result.accessToken);
    this.setCsrfCookie(res);
    return {
      ...result.user,
      accessToken: result.accessToken,
      verificationSent: result.verificationSent,
    };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    let token: string | null = null;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim() || null;
    } else if (req.cookies?.access_token) {
      token = String(req.cookies.access_token);
    }
    if (!token) {
      throw new UnauthorizedException('No session');
    }
    return this.authService.getMeFromAccessToken(token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() dto: SigninDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signin(dto);
    this.setAuthCookie(res, result.accessToken);
    this.setCsrfCookie(res);
    return { ...result.user, accessToken: result.accessToken };
  }
}
