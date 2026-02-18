import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

interface GoogleUser {
  provider: string;
  providerAccountId: string;
  email: string;
  displayName: string;
  avatar: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: GoogleUser) {
    const { provider, providerAccountId, email, displayName, avatar, accessToken, refreshToken } = googleUser;

    let account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: { include: { profile: true } } },
    });

    if (account) {
      await this.prisma.account.update({
        where: { id: account.id },
        data: { accessToken, refreshToken },
      });
      // Update avatar if it changed
      if (avatar && account.user.profile && account.user.profile.avatar !== avatar) {
        await this.prisma.profile.update({
          where: { userId: account.user.id },
          data: { avatar },
        });
      }
      return account.user;
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (user) {
      await this.prisma.account.create({
        data: {
          userId: user.id,
          provider,
          providerAccountId,
          accessToken,
          refreshToken,
        },
      });
      return user;
    }

    user = await this.prisma.user.create({
      data: {
        email,
        isEmailVerified: true,
        accounts: {
          create: {
            provider,
            providerAccountId,
            accessToken,
            refreshToken,
          },
        },
        profile: {
          create: {
            username: email.split('@')[0] + '_' + Date.now().toString(36),
            displayName: displayName || email.split('@')[0],
            avatar: avatar || null,
          },
        },
      },
      include: { profile: true },
    });

    return user;
  }

  generateJwt(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.profile?.displayName || null,
      username: user.profile?.username || null,
      avatar: user.profile?.avatar || null,
      bio: user.profile?.bio || null,
      status: user.profile?.status || 'offline',
    };
  }

  signup() {
    return { msg: 'signed up' };
  }

  signin() {
    return { msg: 'signed in' };
  }
}
