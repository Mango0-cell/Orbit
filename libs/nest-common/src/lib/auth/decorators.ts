import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';
import type { AppAbility, Viewer } from '@orbit/shared-auth';

export const IS_PUBLIC_KEY = 'orbit:isPublic';
export const IS_AUTHENTICATED_KEY = 'orbit:isAuthenticated';
export const CHECK_POLICIES_KEY = 'orbit:checkPolicies';

/** A route-level CASL check run against the caller's ability. */
export type PolicyHandler = (ability: AppAbility) => boolean;

/** Explicitly allow guests on a route, bypassing `@Authenticated`. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Require a logged-in user; guests receive 401. */
export const Authenticated = () => SetMetadata(IS_AUTHENTICATED_KEY, true);

/** Attach CASL policy checks; the PoliciesGuard denies (403) if any fails. */
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

/** Inject the current viewer — an AuthUser, or `null` for a guest. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Viewer =>
    ctx.switchToHttp().getRequest().user ?? null,
);

/** Inject the caller's CASL ability (built by the PoliciesGuard). */
export const CurrentAbility = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AppAbility =>
    ctx.switchToHttp().getRequest().ability,
);
