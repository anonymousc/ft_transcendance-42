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

    // Check if an account with this provider+providerAccountId already exists
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
      // Update tokens on the existing account
      await this.prisma.account.update({
        where: { id: account.id },
        data: { accessToken, refreshToken },
      });
      return account.user;
    }

    // Check if a user with this email already exists (e.g. registered locally)
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (user) {
      // Link the Google account to the existing user
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

    // Create a brand-new user + account + profile
    user = await this.prisma.user.create({
      data: {
        email,
        isEmailVerified: true, // Google emails are verified
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

  signup() {
    return { msg: 'signed up' };
  }

  signin() {
    return { msg: 'signed in' };
  }
}
