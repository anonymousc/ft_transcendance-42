import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

// Calendar scope is below; offline access + consent prompt are set on GoogleOAuthGuard
// so passport.authenticate merges them into Google's authorization URL.
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google', true) {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar.events'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    oauthParams: { expires_in?: number },
    profile: Profile,
  ) {
    const { id, emails, displayName, photos } = profile;

    return {
      provider: 'google',
      providerAccountId: id,
      email: emails?.[0]?.value,
      displayName: displayName,
      avatar: photos?.[0]?.value,
      accessToken,
      refreshToken,
      expiresIn: oauthParams?.expires_in,
    };
  }
}
