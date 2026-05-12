import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { SignupDto, SigninDto } from './dto';
import type { Profile, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { MailService } from './mail.service';

export type SessionUserDto = {
  id: string;
  email: string;
  displayName: string | null;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  status: string;
  interests: unknown;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}
  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getVerificationExpiry() {
    const hours = Number(process.env.EMAIL_VERIFY_TTL_HOURS || 24);
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  private isAutoVerifyEnabled() {
    return (process.env.EMAIL_VERIFY_AUTO || '').toLowerCase() === 'true';
  }

  generateJwt(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private sessionUserDto(user: User & { profile: Profile | null }): SessionUserDto {
    const p = user.profile;
    return {
      id: user.id,
      email: user.email,
      username: p?.username ?? null,
      displayName: p?.displayName ?? null,
      avatar: p?.avatar ?? null,
      bio: p?.bio ?? null,
      status: p?.status ?? 'offline',
      interests: p?.interests ?? null,
    };
  }

  async getMeFromAccessToken(token: string): Promise<SessionUserDto> {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sessionUserDto(user);
  }

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const username = dto.email.split('@')[0] + '_' + Date.now().toString(36);
    const hashPassword = await argon2.hash(dto.password);
    const displayName = `${dto.firstName} ${dto.lastName}`;

    const autoVerify = this.isAutoVerifyEnabled();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hashPassword,
        isEmailVerified: autoVerify,
        accounts: {
          create: { provider: 'local', providerAccountId: dto.email },
        },
        profile: {
          create: { username, displayName },
        },
      },
      include: { profile: true },
    });

    if (!autoVerify) {
      const token = randomBytes(32).toString('hex');
      const tokenHash = this.hashToken(token);

      await this.prisma.emailVerification.deleteMany({
        where: { userId: user.id },
      });

      await this.prisma.emailVerification.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: this.getVerificationExpiry(),
        },
      });

      await this.mailService.sendVerificationEmail(
        user.email,
        token,
        user.profile?.displayName || displayName,
      );
    }

    const accessToken = this.generateJwt(user);

    return {
      accessToken,
      user: this.sessionUserDto(user),
      verificationSent: !autoVerify,
    };
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.hashPassword) {
      throw new BadRequestException('This account has no password set');
    }

    const isPasswordValid = await argon2.verify(user.hashPassword, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      if (this.isAutoVerifyEnabled()) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true },
        });
      } else {
        if (!dto.verificationToken?.trim()) {
          throw new BadRequestException('Email is not verified');
        }

        const tokenHash = this.hashToken(dto.verificationToken.trim());
        const verification = await this.prisma.emailVerification.findFirst({
          where: {
            userId: user.id,
            tokenHash,
            expiresAt: { gt: new Date() },
          },
        });

        if (!verification) {
          throw new UnauthorizedException('Invalid or expired verification token');
        }

        await this.prisma.$transaction([
          this.prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true },
          }),
          this.prisma.emailVerification.deleteMany({
            where: { userId: user.id },
          }),
        ]);
      }
    }

    const accessToken = this.generateJwt(user);

    return {
      accessToken,
      user: this.sessionUserDto(user),
    };
  }
}
