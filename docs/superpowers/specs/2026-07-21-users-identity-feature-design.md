# Feature: Users & Identity (users-service) — Design

**Date:** 2026-07-21 · **Status:** approved · **Owner service:** `users-service` / `db_users`
**Orchestrated by:** `orbit-feature` → slices routed to `orbit-database`, `orbit-auth`,
`orbit-service`, `orbit-events`.

## Purpose
The identity foundation for Orbit: create accounts, issue the JWT that `@orbit/nest-common`'s
guards verify, and read/update profiles under the CASL Profile policy. Nothing downstream
(follow, posts, DMs) can be exercised through the guards without this.

## Scope
`users-service` + `db_users` only. No cross-service gRPC yet. Emits domain events for future
consumers. **Frontend is deferred** (separate `orbit-frontend` slice later).

## Endpoints (domain-oriented, under `/api`)
| Method | Route | Auth | Behavior |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `@Public` | Create account (email, password, tag_name, display_name, accountType). Private accounts start with **all strict toggles** (`defaultPrivateSettings`). 409 on duplicate email/tag_name. Returns `AuthResponse`. |
| POST | `/api/auth/login` | `@Public` | Verify credentials → **issue JWT**. 401 on bad credentials. Returns `AuthResponse`. |
| GET | `/api/users/me` | `@Authenticated` | Caller's own full profile + settings + email. |
| PATCH | `/api/users/me` | `@Authenticated` | Update own profile fields and account settings (accountType + toggles). |
| GET | `/api/users/:idOrTag` | guest-allowed | View a user's profile. **Applies the CASL Profile policy**: owner/public → full; private stranger → **minimal card only** (field-level serialization). |

`GET /api/users/:idOrTag` exercises the policy layer end-to-end even before follow exists:
relationship resolves to `self` (owner) or `none` (everyone else, since `USERS_RELATION` is
not built yet).

## Data model — `USERS` (db_users)
TypeORM entity; `timestamptz` timestamps.

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | uuid PK | `gen_random_uuid()` |
| `email` | varchar, **unique**, not null | login identifier |
| `password` | varchar, not null | **bcrypt hash** (never returned) |
| `tag_name` | varchar, **unique**, not null | the `@handle` |
| `display_name` | varchar, not null | |
| `bio` / `job` / `location` / `website_url` / `profile_photo` | varchar, null | full-profile fields |
| `genre` | varchar, null | |
| `age` | int, null | |
| `account_type` | varchar, not null, default `'public'` | `'public' \| 'private'` |
| `settings` | jsonb, not null | the private toggles (`PrivateSettings`); defaults to `defaultPrivateSettings()` |
| `created_at` / `updated_at` | timestamptz | |

Indexes: unique on `email` and `tag_name`.

> **Schema note:** `account_type` + `settings` extend `CLAUDE.md §5` — required by the
> authorization model (`@orbit/shared-auth`). This is an intentional, documented addition.

## Contracts
- **`@orbit/shared-types` (shared, framework-agnostic):** output/contract types — `UserCard`,
  `UserProfile`, `OwnProfile`, `AuthResponse { accessToken, user }` — and event payloads
  `UserCreatedEvent`, `UserProfileUpdatedEvent`.
- **Input DTOs (in `users-service`):** `RegisterDto`, `LoginDto`, `UpdateProfileDto` — carry
  `class-validator` decorators (validated by the global `ValidationPipe`). Kept in the service
  (not `shared-types`) so `shared-types` stays free of `class-validator`; promote to shared if a
  second service ever needs them.

## Auth
- **Password hashing:** `bcrypt` — hash on register, `compare` on login.
- **JWT issuance:** add a symmetric `signJwt(payload, secret, opts)` to `@orbit/nest-common`
  (alongside `verifyJwt`), signing `{ sub: userId, accountType }` with `JWT_SECRET` and an
  expiry. `users-service` is the only issuer; every service verifies via the guard.
- **Policy application on `GET /api/users/:idOrTag`:** build a `ProfileSubject`
  (`ownerId`, `accountType`, `relationship`, card fields, `bio`, `settings`), then serialize with
  CASL `permittedFieldsOf(ability, 'read', subject)` — owner/public → all fields (`UserProfile`),
  private stranger → card fields only (`UserCard`). Enforces the policy spec's field-level invariant.

## Events (`@orbit/message-broker` + `@orbit/shared-types`)
- `user.created` — `{ userId, tagName, accountType, at }` (consumers: notifications, later).
- `user.profile.updated` — `{ userId, changedFields, at }`.
Published **after** the DB transaction commits; fire-and-forget.

## Slices (dependency order → skill)
1. **Contracts** — output/event types in `shared-types`; broker conventions in `message-broker`.
2. **`orbit-database`** — `USERS` entity + migration; repository.
3. **`orbit-auth`** — `bcrypt` hashing + `signJwt` in `nest-common`; token/credential services.
4. **`orbit-service`** — Auth controller (register/login) + Users/Profile controller
   (me / update-me / get-by-id) with guards + the Profile policy + field-level serialization.
5. **`orbit-events`** — publish `user.created` / `user.profile.updated`.

## Testing
- **Entity/repo:** create + unique-constraint behavior (local Postgres via `docker compose up postgres`).
- **Hashing:** hash ≠ plaintext; `compare` true/false.
- **`signJwt`/`verifyJwt`:** sign→verify roundtrip; expiry.
- **Auth controller:** register creates+hashes; duplicate → 409; login valid → token, invalid → 401.
- **Profile controller:** `/me` requires auth; get-by-id → public full, private stranger card-only,
  owner full (unit tests with a real ability + mocked repo).
- Gate: `nx affected -t build test lint` green; TDD each slice.

## Security notes
- Password hash never leaves the service (excluded from every output DTO).
- `GET /users/:id` serialization is driven by `permittedFieldsOf` — the subject is built from
  server data only (never client input); the policy spec's two invariants apply.
- `email` returned only on `/me` (owner), never on public profile reads.

## Out of scope (later features)
Follow / `USERS_RELATION` (relationship stays `none`/`self`), `THEME`, gRPC (no consumer yet),
refresh tokens / email verification / password reset, rate limiting, and the frontend screens.
