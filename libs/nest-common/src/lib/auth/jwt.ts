import { sign, verify, type SignOptions } from 'jsonwebtoken';
import type { AccountType, AuthUser } from '@orbit/shared-auth';

/** Shape of Orbit's JWT payload (decentralized: every service verifies locally). */
export interface JwtPayload {
  sub: string;
  accountType: AccountType;
  iat?: number;
  exp?: number;
}

/**
 * Verify a JWT with the shared secret and map it to an AuthUser.
 * Returns null on any failure (missing/invalid/expired) — the caller is then a guest.
 */
export function verifyJwt(token: string, secret: string): AuthUser | null {
  // Fail closed on misconfiguration: never "verify" against an empty secret.
  if (!token || !secret) return null;
  try {
    const payload = verify(token, secret) as JwtPayload;
    if (!payload || !payload.sub || !payload.accountType) return null;
    return { id: payload.sub, accountType: payload.accountType };
  } catch {
    return null;
  }
}

/** Issue a JWT for a user, signed with the shared secret. Only the auth owner (users-service) calls this. */
export function signJwt(
  user: AuthUser,
  secret: string,
  expiresIn: SignOptions['expiresIn'] = '1h',
): string {
  const payload: JwtPayload = { sub: user.id, accountType: user.accountType };
  return sign(payload, secret, { expiresIn });
}
