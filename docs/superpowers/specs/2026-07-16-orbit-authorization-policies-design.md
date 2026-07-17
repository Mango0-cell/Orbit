# Orbit Authorization Policies (CASL) — Design

**Date:** 2026-07-16 · **Status:** approved · **Scope:** *policies only* — CASL abilities,
contracts, roles, and permissions in `@orbit/shared-auth`. No NestJS guards, no gRPC, no
service wiring (those come in the service-build phase).

## Model

- **Account type:** every user is `public` or `private`.
- **Relationship** of a viewer **V** to a resource owner **O** (from the follow graph):
  - `none` — no follow either way
  - `follower` — V follows O, **not** mutual (from O's side, "V is my follower")
  - `friend` — mutual follow (V ↔ O). Same label for both account types; effect differs.
- **Viewer** may be an authenticated `AuthUser` **or `null` (guest)**.

## Permission matrix

| Action on O's content | Guest | Public O | Private O |
| --- | --- | --- | --- |
| Minimal card (username, name, avatar, type) | ✅ | ✅ | ✅ |
| Full profile / info / images | public only | ✅ any | friends only |
| Read posts | public only | ✅ any | friends only (+ `postsVisibleToFriends`) |
| React / share a post | ❌ | ✅ any | friends only (+ `allowFriendReactions`) |
| Comment a post | ❌ | ✅ any | friends only (+ `allowFriendComments`) |
| Send DM | ❌ | followers/friends | friend → direct · follower → **request** (+ `allowFollowerMessageRequests`) · none → ✕ |
| Follow O | ❌ | ✅ (open) | ✅ (open follow) |

Everything not granted is **denied by default**.

## Decisions

- **Guest** = most restricted viewer: read-only **public** content + the **minimal card** of
  private accounts. Guests **never** see private posts (a guest can't be a friend). Any
  interaction → denied; the **frontend** turns that denial into a "Sign in?" prompt
  (`isGuest(viewer) && ability.cannot(action, subject)`), so the "sign-in alert" is UI, not a policy rule.
- **Private visibility:** non-friends see the **minimal card** only (discoverable/followable).
- **Public DMs:** **followers-only** (must follow before messaging).
- **Private follow:** **open follow** — anyone follows instantly; sees nothing private until the
  owner follows back (friends).
- **Private toggles (all default `true`; strict lock-out for non-friends is always enforced):**
  `postsVisibleToFriends`, `allowFriendComments`, `allowFriendReactions` (react+share),
  `allowFollowerMessageRequests`. A new private account starts with all toggles on.
- A viewer's **own** account type never limits what they can **do** to others — private only
  limits what others **see** of them. Users always have full rights over their own resources.
- **Notifications** (follow, follow-returned, message-request, message, reaction, share,
  comment) are *events emitted by* these actions — out of scope for the policy layer.

## CASL design (isomorphic ABAC)

`defineAbilitiesFor(viewer: AuthUser | null): AppAbility` builds one ability; each **subject**
instance carries the attributes the rules match on (`ownerAccountType`, `relationship`,
owner `settings`). The minimal card uses CASL **field-level** read.

- **Actions:** `read · react · comment · share · message · request-message · follow · manage`
- **Subjects:** `Profile · Post · DirectMessage · AccountSettings`
- **Subject builders** (`asProfile/asPost/asDirectMessage/asAccountSettings`) tag plain objects
  via `subject()` so the runtime (services, later) constructs them from DB rows + the
  relationship resolved over gRPC.

## Deliverable

`libs/shared-auth/src/lib/`: `types.ts`, `settings.ts`, `subjects.ts`, `abilities.ts`,
`abilities.spec.ts` (the matrix as tests). Depends on `@casl/ability`. Built test-first via the
`orbit-auth` skill, then `ecc:security-reviewer` (deny-by-default, no leakage, private strictness).

## Security notes (the SERVICE layer must enforce these)

The policy trusts the attributes carried on each subject. Two invariants the services that
build subjects must uphold:

1. **Subjects are built from trusted, server-side data only.** `relationship`, `accountType`,
   and owner `settings` are resolved on the server (relationship via gRPC to users-service) —
   **never** accepted from the client. A spoofed `relationship: 'friend'` would defeat the policy.
2. **Field-level reads must be honored on serialization.** The minimal card exposes only
   `username / displayName / avatarUrl / accountType`. When returning a private, non-friend
   profile, the service must emit **only** those fields (e.g. via CASL `permittedFieldsOf`) —
   returning the full row would leak `bio`/settings even though `can('read', …, 'bio')` is false.

## Out of scope (next phases)
NestJS `JwtAuthGuard` / `PoliciesGuard`, JWT verification, relationship resolution over gRPC,
notification events, and the account-settings write API.
