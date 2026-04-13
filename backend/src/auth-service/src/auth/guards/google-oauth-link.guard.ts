import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleOAuthLinkGuard extends AuthGuard('google') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies?.access_token as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }
    const { sub } = this.authService.verifyAccessTokenOrThrow(token);
    (req as Request & { oauthLinkState?: string }).oauthLinkState =
      this.authService.signOAuthLinkState(sub, 'google');
    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<
      Request & { oauthLinkState?: string }
    >();
    return {
      accessType: 'offline' as const,
      prompt: 'consent' as const,
      state: req.oauthLinkState,
    };
  }
}
