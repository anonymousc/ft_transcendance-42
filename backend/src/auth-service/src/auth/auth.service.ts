import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { SignupDto, SigninDto, ChangePasswordDto } from './dto';
import * as argon2 from 'argon2';

interface GoogleUser {
  provider: string;
  providerAccountId: string;
  email: string;
  displayName: string;
  avatar: string;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

interface FortyTwoUser {
  provider: string;
  providerAccountId: string;
  email: string;
  displayName: string;
  avatar: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

type OAuthLinkPayload = { userId: string; provider: 'google' | '42' };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  verifyAccessTokenOrThrow(token: string): { sub: string; email: string } {
    try {
      const payload = this.jwtService.verify<{
        sub?: string;
        email?: string;
        purpose?: string;
      }>(token);
      if (payload.purpose === 'oauth_link' || !payload.sub) {
        throw new UnauthorizedException('Invalid session token');
      }
      return { sub: payload.sub, email: payload.email ?? '' };
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

  signOAuthLinkState(userId: string, provider: 'google' | '42'): string {
    return this.jwtService.sign(
      { purpose: 'oauth_link', provider, sub: userId },
      { expiresIn: '10m' },
    );
  }

  tryParseOAuthLinkState(
    state: string | undefined,
  ): OAuthLinkPayload | null {
    if (!state?.trim()) return null;
    try {
      const payload = this.jwtService.verify<{
        purpose?: string;
        provider?: string;
        sub?: string;
      }>(state);
      if (payload.purpose !== 'oauth_link' || !payload.sub) return null;
      if (payload.provider !== 'google' && payload.provider !== '42') {
        return null;
      }
      return { userId: payload.sub, provider: payload.provider };
    } catch {
      return null;
    }
  }

  async linkGoogleAccount(linkUserId: string, googleUser: GoogleUser) {
    const {
      provider,
      providerAccountId,
      email,
      accessToken,
      refreshToken,
      expiresIn,
    } = googleUser;

    if (!email?.trim()) {
      throw new BadRequestException('Google account has no email; cannot link');
    }

    const expiresAt = Math.floor(Date.now() / 1000) + (expiresIn ?? 3600);

    const existingByProvider = await this.prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    });

    if (existingByProvider && existingByProvider.userId !== linkUserId) {
      throw new ConflictException(
        'This Google account is already linked to another user',
      );
    }

    const otherGoogle = await this.prisma.account.findFirst({
      where: { userId: linkUserId, provider: 'google' },
    });
    if (
      otherGoogle &&
      otherGoogle.providerAccountId !== providerAccountId
    ) {
      throw new ConflictException(
        'Another Google account is already linked to this profile',
      );
    }

    await this.prisma.account.upsert({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      update: {
        userId: linkUserId,
        accessToken,
        refreshToken: refreshToken ?? undefined,
        expiresAt,
      },
      create: {
        userId: linkUserId,
        provider,
        providerAccountId,
        accessToken,
        refreshToken,
        expiresAt,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: linkUserId },
      include: { profile: true },
    });
    if (!user) {
      throw new BadRequestException('User not found while linking Google');
    }
    return user;
  }

  async linkFortyTwoAccount(linkUserId: string, fortyTwoUser: FortyTwoUser) {
    const {
      provider,
      providerAccountId,
      email,
      accessToken,
      refreshToken,
      expiresIn,
    } = fortyTwoUser;

    if (!email?.trim()) {
      throw new BadRequestException('42 account has no email; cannot link');
    }

    const expiresAt = Math.floor(Date.now() / 1000) + (expiresIn ?? 7200);

    const existingByProvider = await this.prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    });

    if (existingByProvider && existingByProvider.userId !== linkUserId) {
      throw new ConflictException(
        'This 42 account is already linked to another user',
      );
    }

    const other42 = await this.prisma.account.findFirst({
      where: { userId: linkUserId, provider: '42' },
    });
    if (other42 && other42.providerAccountId !== providerAccountId) {
      throw new ConflictException(
        'Another 42 account is already linked to this profile',
      );
    }

    await this.prisma.account.upsert({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      update: {
        userId: linkUserId,
        accessToken,
        refreshToken: refreshToken ?? undefined,
        expiresAt,
      },
      create: {
        userId: linkUserId,
        provider,
        providerAccountId,
        accessToken,
        refreshToken: refreshToken ?? null,
        expiresAt,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: linkUserId },
      include: { profile: true },
    });
    if (!user) {
      throw new BadRequestException('User not found while linking 42');
    }
    return user;
  }

  async validateGoogleUser(googleUser: GoogleUser) {
    const {
      provider,
      providerAccountId,
      email,
      displayName,
      avatar,
      accessToken,
      refreshToken,
      expiresIn,
    } = googleUser;

    const expiresAt = Math.floor(Date.now() / 1000) + (expiresIn ?? 3600);

    const existingAccount = await this.prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: { include: { profile: true } } },
    });

    let userId: string;

    if (existingAccount) {
      userId = existingAccount.userId;
    } else {
      let user = await this.prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            isEmailVerified: true,
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
      }

      userId = user.id;
    }

    await this.prisma.account.upsert({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      update: {
        accessToken,
        refreshToken: refreshToken ?? undefined,
        expiresAt,
      },
      create: {
        userId,
        provider,
        providerAccountId,
        accessToken,
        refreshToken,
        expiresAt,
      },
    });

    if (existingAccount && avatar && existingAccount.user.profile?.avatar !== avatar) {
      await this.prisma.profile.update({
        where: { userId: existingAccount.user.id },
        data: { avatar },
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new BadRequestException('Failed to resolve user after Google sign-in');
    }

    return user;
  }

  async validateFortyTwoUser(fortyTwoUser: FortyTwoUser) {
    const {
      provider,
      providerAccountId,
      email,
      displayName,
      avatar,
      accessToken,
      refreshToken,
      expiresIn,
    } = fortyTwoUser;

    if (!email?.trim()) {
      throw new BadRequestException('42 account has no email; cannot complete sign-in');
    }

    const expiresAt = Math.floor(Date.now() / 1000) + (expiresIn ?? 7200);

    const existingAccount = await this.prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: { include: { profile: true } } },
    });

    let userId: string;

    if (existingAccount) {
      userId = existingAccount.userId;
    } else {
      let user = await this.prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            isEmailVerified: true,
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
      }

      userId = user.id;
    }

    await this.prisma.account.upsert({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      update: {
        accessToken,
        refreshToken: refreshToken ?? undefined,
        expiresAt,
      },
      create: {
        userId,
        provider,
        providerAccountId,
        accessToken,
        refreshToken: refreshToken ?? null,
        expiresAt,
      },
    });

    if (existingAccount && avatar && existingAccount.user.profile?.avatar !== avatar) {
      await this.prisma.profile.update({
        where: { userId: existingAccount.user.id },
        data: { avatar },
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new BadRequestException('Failed to resolve user after 42 sign-in');
    }

    return user;
  }

  async getValidGoogleAccessToken(userId: string): Promise<string> {
    const account = await this.prisma.account.findFirst({
      where: { userId, provider: 'google' },
    });

    if (!account?.accessToken) {
      throw new Error(
        'No Google account linked. Please sign in with Google to use calendar export.',
      );
    }

    if (
      account.expiresAt != null &&
      account.expiresAt * 1000 > Date.now() + 60_000
    ) {
      return account.accessToken;
    }

    if (!account.refreshToken) {
      throw new Error(
        'No Google account linked. Please sign in with Google to use calendar export.',
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error('Google token refresh failed. Please reconnect your Google account.');
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: account.refreshToken,
      grant_type: 'refresh_token',
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const json = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      error?: string;
    };

    if (!res.ok || !json.access_token) {
      throw new Error('Google token refresh failed. Please reconnect your Google account.');
    }

    const newExpiresAt = Math.floor(Date.now() / 1000) + (json.expires_in ?? 3600);

    await this.prisma.account.update({
      where: { id: account.id },
      data: {
        accessToken: json.access_token,
        expiresAt: newExpiresAt,
      },
    });

    return json.access_token;
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
      interests: user.profile?.interests ?? null,
      hasPassword: !!user.hashPassword,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.hashPassword) {
      throw new BadRequestException(
        'This account has no password. Sign in with your linked provider instead.',
      );
    }
    const currentOk = await argon2.verify(
      user.hashPassword,
      dto.currentPassword,
    );
    if (!currentOk) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException(
        'New password must be different from your current password',
      );
    }
    const newHash = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashPassword: newHash },
    });
    return { ok: true };
  }

  /** OAuth provider ids stored on `Account.provider` (see strategies). */
  async getLinkedOAuthProviders(userId: string): Promise<string[]> {
    const rows = await this.prisma.account.findMany({
      where: {
        userId,
        provider: { in: ['google', '42'] },
      },
      select: { provider: true },
      distinct: ['provider'],
    });
    return rows.map((r) => r.provider);
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

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hashPassword,
        isEmailVerified: false,
        accounts: {
          create: { provider: 'local', providerAccountId: dto.email },
        },
        profile: {
          create: { username, displayName },
        },
      },
      include: { profile: true },
    });

    const token = this.generateJwt(user);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.profile?.username,
        displayName: user.profile?.displayName,
      },
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
      throw new BadRequestException(
        'This account was created via OAuth. Please sign in with your OAuth provider.',
      );
    }

    const isPasswordValid = await argon2.verify(user.hashPassword, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateJwt(user);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.profile?.username,
        displayName: user.profile?.displayName,
      },
    };
  }
}
