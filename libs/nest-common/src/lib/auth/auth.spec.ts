import { sign } from 'jsonwebtoken';
import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { verifyJwt } from './jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PoliciesGuard } from './policies.guard';
import {
  CHECK_POLICIES_KEY,
  IS_AUTHENTICATED_KEY,
  IS_PUBLIC_KEY,
} from './decorators';

const SECRET = 'test-secret';
const tok = (payload: object, secret = SECRET, opts: object = {}) =>
  sign(payload, secret, opts);

function ctx(req: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => ({}) }),
    getHandler: () => () => undefined,
    getClass: () => class {},
  } as unknown as ExecutionContext;
}
function reflector(meta: Record<string, unknown> = {}): Reflector {
  return { getAllAndOverride: (key: string) => meta[key] } as unknown as Reflector;
}

describe('verifyJwt', () => {
  it('maps a valid token to an AuthUser', () => {
    expect(verifyJwt(tok({ sub: 'u1', accountType: 'public' }), SECRET)).toEqual({
      id: 'u1',
      accountType: 'public',
    });
  });
  it('returns null for the wrong secret', () => {
    expect(verifyJwt(tok({ sub: 'u1', accountType: 'public' }), 'other')).toBeNull();
  });
  it('returns null for garbage or expired tokens', () => {
    expect(verifyJwt('not-a-jwt', SECRET)).toBeNull();
    expect(
      verifyJwt(tok({ sub: 'u1', accountType: 'public' }, SECRET, { expiresIn: -10 }), SECRET),
    ).toBeNull();
  });
  it('returns null when required claims are missing', () => {
    expect(verifyJwt(tok({ foo: 'bar' }), SECRET)).toBeNull();
  });
  it('fails closed when the secret is empty', () => {
    expect(verifyJwt(tok({ sub: 'u1', accountType: 'public' }), '')).toBeNull();
  });
});

describe('JwtAuthGuard', () => {
  const guard = (meta: Record<string, unknown> = {}) =>
    new JwtAuthGuard(reflector(meta), SECRET);

  it('allows a guest (no token) and sets req.user = null', () => {
    const req: Record<string, unknown> = { headers: {} };
    expect(guard().canActivate(ctx(req))).toBe(true);
    expect(req.user).toBeNull();
  });
  it('attaches the user for a valid token', () => {
    const req: Record<string, unknown> = {
      headers: { authorization: `Bearer ${tok({ sub: 'u1', accountType: 'private' })}` },
    };
    expect(guard().canActivate(ctx(req))).toBe(true);
    expect(req.user).toEqual({ id: 'u1', accountType: 'private' });
  });
  it('rejects a present-but-invalid token with 401', () => {
    const req = { headers: { authorization: 'Bearer garbage' } };
    expect(() => guard().canActivate(ctx(req))).toThrow(UnauthorizedException);
  });
  it('blocks a guest on an @Authenticated route', () => {
    const req = { headers: {} };
    expect(() =>
      guard({ [IS_AUTHENTICATED_KEY]: true }).canActivate(ctx(req)),
    ).toThrow(UnauthorizedException);
  });
  it('@Public bypasses @Authenticated for guests', () => {
    const req = { headers: {} };
    expect(
      guard({ [IS_AUTHENTICATED_KEY]: true, [IS_PUBLIC_KEY]: true }).canActivate(ctx(req)),
    ).toBe(true);
  });
});

describe('PoliciesGuard', () => {
  const guard = (meta: Record<string, unknown> = {}) => new PoliciesGuard(reflector(meta));

  it('builds req.ability and passes with no policies', () => {
    const req: Record<string, unknown> = { user: { id: 'u1', accountType: 'public' } };
    expect(guard().canActivate(ctx(req))).toBe(true);
    expect(req.ability).toBeDefined();
  });
  it('passes when the policy holds (authed can follow)', () => {
    const req = { user: { id: 'u1', accountType: 'public' } };
    expect(
      guard({ [CHECK_POLICIES_KEY]: [(a: { can: (x: string, y: string) => boolean }) => a.can('follow', 'Profile')] }).canActivate(ctx(req)),
    ).toBe(true);
  });
  it('denies (403) when the policy fails (guest cannot follow)', () => {
    const req = { user: null };
    expect(() =>
      guard({ [CHECK_POLICIES_KEY]: [(a: { can: (x: string, y: string) => boolean }) => a.can('follow', 'Profile')] }).canActivate(ctx(req)),
    ).toThrow(ForbiddenException);
  });
});
