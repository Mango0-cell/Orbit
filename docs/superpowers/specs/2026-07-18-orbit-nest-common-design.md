# @orbit/nest-common — cross-cutting NestJS providers — Design

**Date:** 2026-07-18 · **Status:** approved · **Scope:** one shared NestJS library that bundles
guards, validation pipe, response interceptor, exception filter, and a request-context
middleware, wired as global providers via a single module. Consumes the CASL policies from
`@orbit/shared-auth`.

## Decisions
- **Location:** new lib `@orbit/nest-common` (keeps `@orbit/shared-auth` framework-agnostic /
  browser-importable).
- **Envelope:** success → `{ data, meta }`; error → `{ error: { code, message, details? }, meta }`,
  where `meta = { requestId, timestamp }`.
- **JWT:** real verification via `jsonwebtoken`. `verifyJwt` + `JwtPayload` live in
  `nest-common` (Node-only), **not** in `shared-auth`, so `shared-auth` stays browser-safe.
- **Auth posture:** guest-allowed by default — the guard attaches `req.user` when a valid token
  is present and leaves it `null` (guest) otherwise; routes opt in to requiring login with
  `@Authenticated()`. Matches the policy layer (guests may read public content).

## Components (`libs/nest-common/src/lib/`)
- **`envelope/response.interceptor.ts`** — wraps handler return in `{ data, meta }`.
- **`envelope/all-exceptions.filter.ts`** — catches any error → `{ error: { code, message,
  details? }, meta }`; `HttpException` keeps its status + message, unknown → 500 (message hidden).
- **`envelope/envelope.types.ts`** — `Meta`, `SuccessEnvelope<T>`, `ErrorEnvelope`.
- **`validation/validation.pipe.ts`** — factory returning a `ValidationPipe`
  (`whitelist`, `forbidNonWhitelisted`, `transform`, `enableImplicitConversion`).
- **`auth/jwt.ts`** — `JwtPayload` + `verifyJwt(token, secret): AuthUser | null`.
- **`auth/jwt-auth.guard.ts`** — reads `Authorization: Bearer`; valid → `req.user`; token present
  but invalid → 401; missing → guest (`null`). Enforces `@Authenticated()` (guest → 401);
  `@Public()` overrides.
- **`auth/policies.guard.ts`** — sets `req.ability = defineAbilitiesFor(req.user)`; runs any
  `@CheckPolicies(handler)` → 403 on failure. Fine-grained resource checks stay in services.
- **`auth/*.decorator.ts`** — `@Public` · `@Authenticated` · `@CheckPolicies` · `@CurrentUser`
  (param) · `@CurrentAbility` (param).
- **`context/request-context.middleware.ts`** — sets `x-request-id`
  (`crypto.randomUUID()`, honoring an inbound id) and logs method/url/status/duration.
- **`orbit-common.module.ts`** — `OrbitCommonModule.forRoot(options?)` registers `APP_PIPE`,
  `APP_FILTER`, `APP_INTERCEPTOR`, `APP_GUARD` (JwtAuth then Policies), and applies the
  middleware in `configure()`. Reads `JWT_SECRET` from env unless overridden.

## Data flow
middleware (request-id) → `JwtAuthGuard` (→ `req.user`) → `PoliciesGuard` (→ `req.ability`,
`@CheckPolicies`) → `ValidationPipe` (parse/validate DTO) → handler → `ResponseInterceptor`
(`{ data, meta }`); any throw → `AllExceptionsFilter` (`{ error, meta }`).

## Usage
```ts
@Module({ imports: [OrbitCommonModule.forRoot()] })
export class AppModule {}
```
All globals register through the module — no `main.ts` changes. `JWT_SECRET` from env.

## Testing
Unit tests (mock `ExecutionContext`/`ArgumentsHost`) per provider: guest allowed, invalid-token
→ 401, `@Authenticated` blocks guest, `@Public` bypass, `@CheckPolicies` → 403, response
wrapping, error shaping (HttpException + unknown), unknown-field rejection, request-id set.

## Out of scope
DTOs per domain, `@nestjs/config` module wiring, refresh tokens / token issuance (login endpoint),
rate limiting, and applying `@CheckPolicies` to real routes (done as services are built).
