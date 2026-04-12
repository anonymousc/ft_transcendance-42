import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

interface FortyTwoUser {
  provider: string;
  providerAccountId: string;
  email: string;
  displayName: string;
  avatar: string;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class FortyTwoAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateFortyTwoUser(fortyTwoUser: FortyTwoUser) {
    const { provider, providerAccountId, email, displayName, avatar, accessToken, refreshToken } = fortyTwoUser;

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
}
