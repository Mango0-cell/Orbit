---
name: orbit-auth
description: Implement or extend Orbit's decentralized auth in @orbit/shared-auth — JWT verification guard + CASL isomorphic ABAC ability factory — and apply it locally inside a service. Use when protecting endpoints or adding a permission/ability. Nginx only routes; each service verifies the JWT and evaluates CASL locally. Trigger words: auth, JWT, CASL, ABAC, guard, permission, authorization, protect endpoint, shared-auth.
---

# orbit-auth — decentralized JWT + CASL ABAC

Read `CLAUDE.md §7` (Security & Authorization). Invoke `ecc:security-review`; review with
`ecc:security-reviewer`.

## Rules
- Auth is **decentralized**: the gateway (Nginx) does **not** authenticate. Every service
  verifies the JWT itself and evaluates CASL abilities **locally**.
- Shared logic — `JwtPayload` type, `verifyJwt` helper, `defineAbilitiesFor(user)` (CASL) —
  lives in `@orbit/shared-auth`. **Isomorphic**: imported by every service, no central runtime.
- **ABAC:** build the caller's ability from JWT claims + resource attributes; check
  `can(action, subject)` before acting. **Deny by default.**
- `JWT_SECRET` / public key from env. Never commit secrets.

## Steps
1. In `@orbit/shared-auth`: `JwtPayload` interface, a `verifyJwt` helper, and
   `defineAbilitiesFor(user)` returning a CASL `Ability`.
2. In each service: a NestJS `JwtAuthGuard` (verify token) + a `PoliciesGuard` / decorator
   that checks CASL abilities.
3. Apply guards on domain controllers; **deny by default**, allow explicitly.
4. TDD: valid / invalid / expired token; allowed vs denied ability cases.
5. `ecc:security-reviewer` pass (token handling, ability leakage, deny-by-default).

## Definition of Done
`shared-auth` exports JWT + CASL · guards applied per service · deny-by-default · secrets
from env · security review passed. **Do not push.**
