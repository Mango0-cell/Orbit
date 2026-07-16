---
name: orbit-service
description: Build or extend a NestJS microservice in Orbit (users-service, content-service, chat-service, notifications-service) end-to-end — module, domain controller, service, DTOs, TypeORM entity, and REST/gRPC/WebSocket/RabbitMQ wiring. Use when adding or extending a backend feature or endpoint inside apps/*-service. Enforces database-per-service, domain-oriented APIs, and the protocol-per-job split. Trigger words: build service, add endpoint, new module, service feature, backend feature.
---

# orbit-service — build a NestJS microservice feature

Read `CLAUDE.md` (§1 golden rules, §4 services, §5 data model, §6 comms, §7 auth) and
`AGENTS.md` (§2 domain ownership, §4 guardrails) **before** doing anything.

## When to use
Any backend feature inside `apps/users-service`, `apps/content-service`,
`apps/chat-service`, or `apps/notifications-service`.

## Rules (non-negotiable — from CLAUDE.md)
- The service reads/writes **only its own database** (`db_users` / `db_content` /
  `db_chat` / `db_notifications`). No cross-database SQL, no cross-database FK.
- Need another domain's data? **gRPC** (sync — use `orbit-grpc`) or **RabbitMQ event**
  (async — use `orbit-events`). Never import another service's source.
- APIs are **domain-oriented** (`GET /api/users/:id/posts`), not table-oriented. Global prefix `api`.
- Protocol per job: REST at the edge, gRPC backend↔backend, WebSockets realtime, RabbitMQ async.
- Protect endpoints locally with JWT + CASL from `@orbit/shared-auth` (use `orbit-auth`).
- **English only.** Strict TypeScript.

## Workflow (AGENTS.md spine)
1. `superpowers:brainstorming` — align on the feature (skip only for trivial edits).
2. `superpowers:writing-plans` — order the steps.
3. `superpowers:test-driven-development` — write Jest specs first (`*.spec.ts`).
4. Implement with `ecc:nestjs-patterns` + `ecc:backend-patterns`:
   - DTOs / contract types → add to `@orbit/shared-types` **first**.
   - Entity + migration → use `orbit-database`.
   - Module / controller / service under `apps/<svc>/src/app/<domain>/`.
   - Cross-domain reads → `orbit-grpc`; side-effects → `orbit-events`.
5. Review with `ecc:typescript-reviewer` (+ `ecc:database-reviewer` if the schema changed).
6. Verify: `npx nx test <svc>`, `npx nx lint <svc>`, `npx nx build <svc>` green; then
   `superpowers:verification-before-completion`.

## Scaffolding
Use Nx generators, never hand-rolled config:
`npx nx g @nx/nest:module <domain> --project=<svc>` (plus `:controller`, `:service`).

## Definition of Done
Tests pass · `nx affected -t build test lint` green · contracts in `shared-types` ·
reviewer approved · no cross-DB access. **Do not push.**
