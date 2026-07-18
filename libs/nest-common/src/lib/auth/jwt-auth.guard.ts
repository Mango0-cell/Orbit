import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyJwt } from './jwt';
import { IS_AUTHENTICATED_KEY, IS_PUBLIC_KEY } from './decorators';
import { JWT_SECRET_TOKEN } from '../orbit-common.tokens';

/**
 * Parses `Authorization: Bearer <jwt>`, verifies it locally, and attaches
 * `req.user` (AuthUser) or leaves it `null` (guest). Guest-allowed by default:
 * - a present-but-invalid token → 401
 * - a missing token → guest (allowed), unless the route is `@Authenticated()`
 * - `@Public()` always allows guests.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(JWT_SECRET_TOKEN) private readonly secret: string,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers?.authorization;
    const token =
      header && header.startsWith('Bearer ') ? header.slice(7).trim() : undefined;

    let user = null;
    if (token) {
      user = verifyJwt(token, this.secret);
      if (!user) throw new UnauthorizedException('Invalid or expired token');
    }
    req.user = user; // AuthUser | null (guest)

    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }
    const requiresAuth = this.reflector.getAllAndOverride<boolean>(
      IS_AUTHENTICATED_KEY,
      targets,
    );
    if (requiresAuth && !user) {
      throw new UnauthorizedException('Authentication required');
    }
    return true;
  }
}
