import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { defineAbilitiesFor } from '@orbit/shared-auth';
import { CHECK_POLICIES_KEY, type PolicyHandler } from './decorators';

/**
 * Builds the caller's CASL ability from `req.user` (set by JwtAuthGuard), attaches
 * it as `req.ability`, and enforces any `@CheckPolicies(...)` on the route (403 on
 * failure). Fine-grained, resource-attribute checks stay in services via
 * `@CurrentAbility()` — guards can't see the not-yet-loaded resource.
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const ability = defineAbilitiesFor(req.user ?? null);
    req.ability = ability;

    const handlers =
      this.reflector.getAllAndOverride<PolicyHandler[]>(CHECK_POLICIES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (!handlers.every((handler) => handler(ability))) {
      throw new ForbiddenException('Forbidden by policy');
    }
    return true;
  }
}
