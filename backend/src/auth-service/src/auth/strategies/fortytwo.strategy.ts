import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import OAuth2Strategy = require('passport-oauth2');

interface FortyTwoProfile {
  id: number;
  email: string;
  displayname: string;
  image?: {
    link?: string;
  };
}

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(OAuth2Strategy, '42', true) {
  private readonly logger = new Logger(FortyTwoStrategy.name);
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const readConfig = (key: string): string | undefined => {
      const raw = configService.get<string>(key);
      const value = raw?.trim();
      if (!value || value === 'null' || value === 'undefined') {
        return undefined;
      }
      return value;
    };

    const clientID = readConfig('FORTYTWO_CLIENT_ID');
    const clientSecret = readConfig('FORTYTWO_CLIENT_SECRET');
    const callbackURL = readConfig('FORTYTWO_CALLBACK_URL');

    const isConfigured = Boolean(clientID && clientSecret && callbackURL);

    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: clientID || 'disabled-42-client-id',
      clientSecret: clientSecret || 'disabled-42-client-secret',
       callbackURL: callbackURL || 'https://localhost/auth/42/callback-disabled',
      scope: ['public'],
    });

    this.isConfigured = isConfigured;
    if (!this.isConfigured) {
      this.logger.warn(
        '42 OAuth is disabled. Set FORTYTWO_CLIENT_ID, FORTYTWO_CLIENT_SECRET, and FORTYTWO_CALLBACK_URL to enable it.',
      );
    }
  }

  userProfile(accessToken: string, done: (err?: Error | null, profile?: FortyTwoProfile) => void): void {
    if (!this.isConfigured) {
      return done(new UnauthorizedException('42 OAuth is not configured on the server') as unknown as Error);
    }

    (this as any)._oauth2.get('https://api.intra.42.fr/v2/me', accessToken, (err: Error | null, body: string) => {
      if (err) {
        return done(err);
      }

      try {
        const parsed = JSON.parse(body as string) as FortyTwoProfile;
        return done(null, parsed);
      } catch {
        return done(new Error('Failed to parse 42 profile response'));
      }
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    oauthParams: { expires_in?: number },
    profile: FortyTwoProfile,
  ) {
    if (!this.isConfigured) {
      throw new UnauthorizedException('42 OAuth is not configured on the server');
    }

    return {
      provider: '42',
      providerAccountId: String(profile.id),
      email: profile.email,
      displayName: profile.displayname,
      avatar: profile.image?.link,
      accessToken,
      refreshToken,
      expiresIn: oauthParams?.expires_in,
    };
  }
}
