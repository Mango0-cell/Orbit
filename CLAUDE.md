# Orbit

Orbit is a **social network** built as a **microservices** system on an **Nx
monorepo**: isolated, independently scalable services that fail in isolation
rather than together. This file is the **first point of information** — the
shared source of truth for what Orbit is, how it's shaped, and the rules every
change must respect. For *who does the work* (which skills/agents own which
task), see [`AGENTS.md`](./AGENTS.md).

> Status: **environment prepared, features not built.** The Nx workspace,
> service skeletons, shared libs, and local Docker stack exist. Business logic,
> gRPC contracts, database schemas, the auth layer, and the deployment layer
> (Nginx/K8s) are the next phases.
>
> ⚠️ There is **no `orbit-backend/` monolith**. Orbit is an Nx monorepo of
> independent services under `apps/` — never treat it as a single REST API.

---

## 1. Golden rules (non-negotiable)

1. **Database per service.** Each service owns exactly one database, holds its
   **own isolated connection**, and is the only reader/writer of it.
   **No cross-database joins and no cross-database foreign keys, ever.**
2. **Cross-domain data travels over the wire, not over SQL.** Need data another
   service owns? Get it **synchronously via gRPC** (API Composition) or react to
   an **asynchronous RabbitMQ event**. Never reach into another service's tables.
3. **Referential integrity across domains is handled by events / API
   Composition**, not by SQL FKs. A `user_id` stored in `db_content` is a
   *logical* reference to a user owned by `db_users`.
4. **APIs are organized by business domain, not by database table.**
   (`GET /api/users/:id/posts`, not `GET /api/post_reactions`.)
5. **Protocol per job:** REST at the edge (through Nginx), gRPC between backends
   (sync), WebSockets for real-time, RabbitMQ Pub/Sub for async side-effects.
6. **Auth is decentralized.** JWT is verified and CASL abilities are evaluated
   **locally inside each service** — Nginx only routes. Shared auth logic lives
   in `@orbit/shared-auth`.
7. **Contracts are shared, implementations are not.** Types/DTOs/proto-derived
   interfaces live in `@orbit/shared-types`; auth primitives in
   `@orbit/shared-auth`; broker helpers in `@orbit/message-broker`. Services
   depend on the contract, never on each other's source.
8. **Scaffold with Nx generators, run tasks through Nx.** Don't hand-roll
   project config; don't call the underlying tooling directly.

---

## 2. Architecture at a glance

```
                         ┌───────────────────────────┐
        Browser  ──────► │   Nginx (edge / gateway)   │   REST / WS
                         │  reverse proxy + LB + TLS  │   (routing only — no auth)
                         └─────┬───────┬───────┬──────┘
                               │       │       │
                 /api/users/*  │       │       │ /ws/chat/*
                               ▼       ▼       ▼
                    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐
                    │  users   │ │ content  │ │   chat   │ │  notifications    │
                    │  :3001   │ │  :3002   │ │  :3003   │ │      :3004        │
                    └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────────┬─────────┘
   each service:         │            │            │                 │
   • verifies JWT   gRPC (sync) ◄─────┘  (content asks users         │
   • evaluates CASL      │              "is this profile public?")   │
     locally             ▼                ▼               ▼          │
                 db_users        db_content       db_chat        db_notifications
                    ▲                ▲               ▲                 ▲
                    └──────── RabbitMQ (Pub/Sub, async side-effects) ──┘
                             e.g. user.profile.updated, post.created
```

Frontend (Next.js) is served at the edge; every backend call goes through Nginx
by URL. Backends talk to each other **synchronously over gRPC** and
**asynchronously over RabbitMQ**. Authentication/authorization happens **inside
each service**, not at the gateway.

---

## 3. Monorepo layout (Nx)

```
apps/
  orbit-frontend/          Next.js + React 19 + Tailwind v4 (App Router)   :3000
  users-service/           NestJS — users, relations, themes               :3001 / gRPC 50051
  content-service/         NestJS — posts, comments, reactions             :3002 / gRPC 50052
  chat-service/            NestJS — direct messaging (WebSockets)          :3003 / gRPC 50053
  notifications-service/   NestJS — notifications (event consumer)         :3004 / gRPC 50054
libs/
  shared-types/            @orbit/shared-types   — interfaces, DTOs, contract types  ✅ scaffolded
  message-broker/          @orbit/message-broker — RabbitMQ config + Pub/Sub helpers ✅ scaffolded
  shared-auth/             @orbit/shared-auth    — JWT verify + CASL abilities (ABAC) ✅ scaffolded (skeleton)
infra/
  docker/                  per-app Dockerfiles (active)
  postgres/init/           creates the 4 dev databases (active)
  nginx/                   routing contract + reference config (deployment phase)
  k8s/                     manifests placeholder (deployment phase)
docker-compose.yml         local dev stack (Nginx-less; services on host ports)
```

- npm scope is `@orbit/*`; import shared code as `@orbit/shared-types`,
  `@orbit/message-broker`, `@orbit/shared-auth`.
- Workspace is an Nx **integrated / TS-solution** monorepo (project references,
  `apps/*` + `libs/*` npm workspaces). Nx Cloud is disabled.
- All 8 projects are scaffolded (5 apps + 3 libs); `@orbit/shared-auth` is a skeleton — implement JWT/CASL logic in the features phase.

---

## 4. Services & responsibilities

| Service                 | Owns (DB)          | Edge protocol   | gRPC | Talks to (sync)          | Emits/consumes (async) |
| ----------------------- | ------------------ | --------------- | ---- | ------------------------ | ---------------------- |
| `users-service`         | `db_users`         | REST :3001      | 50051 | —                        | user/follow events     |
| `content-service`       | `db_content`       | REST :3002      | 50052 | users (profile checks)   | post/comment events    |
| `chat-service`          | `db_chat`          | WebSocket :3003 | 50053 | users (participants)     | message events         |
| `notifications-service` | `db_notifications` | REST + WS :3004 | 50054 | —                        | **consumes** all events → notifications |

Ports: REST/WS on `300x`, gRPC on `500x`. Services read config from env
(`PORT`, `GRPC_URL`, `DATABASE_URL`, `RABBITMQ_URL`, `JWT_SECRET`, `*_GRPC_URL`).

---

## 5. Data model — database per service

Each block is a **separate database with its own isolated connection**, owned by
exactly one service. Modeled with TypeORM (`@nestjs/typeorm` + `pg`) during
feature work. `timestamptz` for all timestamps. **No SQL foreign keys cross a
database boundary** — cross-domain `user_id`/`post_id` values are logical
references, validated/enriched via gRPC (API Composition) or kept in sync via
RabbitMQ events.

### `db_users` (users-service)
- **USERS** — `user_id` PK, email, password, tag_name, display_name, bio, job,
  location, website_url, profile_photo, genre, age, created_at, updated_at.
- **USERS_RELATION** — `relation_id` PK, `follower_user_id` FK, `following_user_id`
  FK, relation_type, created_at. (Follow graph — FKs are **in-database** only.)
- **THEME** — `theme_id` PK, `user_id` FK, type, entity_type, entity_id,
  `metadata` jsonb, updated_at. (Per-user UI/entity theming.)

### `db_content` (content-service)
- **POSTS** — `post_id` PK, `user_id` (logical), content, visibility, created_at, updated_at.
- **COMMENTS** — `comment_id` PK, `post_id` FK, `user_id` (logical),
  `parent_comment_id` FK (self, threaded), body, created_at, updated_at.
- **ATTACHMENTS** — `attachment_id` PK, `post_id` FK, file_url, file_type, created_at.
- **POST_REACTIONS** — `reaction_id` PK, `user_id` (logical), `post_id` FK, reaction_type, created_at.
- **SAVED_POST** — `saved_post_id` PK, `user_id` (logical), `post_id` FK, save_label, created_at.

### `db_chat` (chat-service)
- **DIRECT_CONVERSATIONS** — `conversation_id` PK, `user_1_id` (logical), `user_2_id` (logical),
  created_at, updated_at.
- **DIRECT_MESSAGES** — `message_id` PK, `conversation_id` FK, `sender_user_id` (logical),
  `receiver_user_id` (logical), message_body, created_at, updated_at.

### `db_notifications` (notifications-service)
- **NOTIFICATIONS** — `notification_id` serial PK, `user_id` (logical), type, title, body,
  entity_type, entity_id, `is_read` bool, `metadata` jsonb, read_at, created_at.

> Physical dev DB names are `db_users` / `db_content` / `db_chat` /
> `db_notifications` (see `infra/postgres/init`). In production each is a
> separate PostgreSQL instance.

---

## 6. Communication model

| Layer                     | Protocol   | When                                          | Example |
| ------------------------- | ---------- | --------------------------------------------- | ------- |
| **Entry (API Gateway)**   | REST / WS  | All external traffic enters through **Nginx** (reverse proxy) and is routed by URL | `GET orbit.com/api/users/123/posts` |
| **Synchronous internal**  | **gRPC**   | A service needs another's data *right now* (API Composition) | content-service asks users-service "is profile 123 public?" before returning posts |
| **Real-time push**        | WebSocket  | Server → client live updates                  | chat messages, live notifications |
| **Asynchronous internal** | **RabbitMQ** (Pub/Sub) | A service announces a **state change**; others react, decoupled | `user.profile.updated`, `post.created`, `user.followed` |

### Request procedure (the canonical flow)
1. **Frontend → Nginx** over REST, e.g. `GET /api/users/123/posts`.
2. **Nginx → service**: routes by URL to `content-service` (gateway does **not**
   authenticate — it only proxies/load-balances).
3. **Service authenticates locally**: verifies the JWT and evaluates CASL
   abilities (see §7) before doing any work.
4. **Backend → backend (sync)**: if content-service must confirm the profile is
   public first, it makes a fast **gRPC** call to users-service (API Composition).
5. **Async side-effects** (notifications, fan-out, counters) are **published to
   RabbitMQ** as domain events and handled by subscribers (e.g.
   notifications-service) — the original request does not wait on them.

**RabbitMQ Pub/Sub conventions:** producers publish domain events to exchanges
using `domain.entity.action` names (e.g. `user.profile.updated`); interested
services bind queues and consume. Events are fire-and-forget and must not couple
producer to consumer. Shared broker config + helpers live in
`@orbit/message-broker`; event payload shapes live in `@orbit/shared-types`.

---

## 7. Security & Authorization

Authentication and authorization are **decentralized** — enforced inside each
service, never at the gateway.

- **Authentication (JWT).** Clients authenticate and receive a JWT. Every
  service verifies the token itself using shared logic in **`@orbit/shared-auth`**
  (`JWT_SECRET` / public key from env). Nginx forwards the `Authorization`
  header untouched; it does **not** validate it.
- **Authorization (CASL, isomorphic ABAC).** Permissions use **CASL** with
  **Attribute-Based Access Control**: the same ability definitions are shared
  (isomorphic) via `@orbit/shared-auth` and **evaluated locally in each
  microservice** *after* Nginx routes the request. A service builds the caller's
  ability from JWT claims + resource attributes and checks `can(action, subject)`
  before acting.
- **Why decentralized:** keeps services independently deployable and fault-
  isolated — no central auth service becomes a bottleneck or single point of
  failure. Shared *rules* (not a shared *runtime*) live in `@orbit/shared-auth`.

> `@orbit/shared-auth` is **scaffolded (skeleton)** — the JWT verification and
> CASL ability definitions are implemented in the features phase.

---

## 8. Local development

Prerequisites: Node 22+, npm, Docker.

```bash
npm install                              # once (uses .npmrc → legacy-peer-deps)

# 1) Bring up infrastructure (Postgres + the 4 DBs, RabbitMQ). Run this FIRST:
docker compose up postgres rabbitmq
#    (full stack incl. Nginx is a deployment-phase concern — see §9)

# 2) Run services/apps with hot reload (fastest inner loop):
npx nx serve users-service               # or content-service / chat-service / notifications-service
npx nx serve orbit-frontend

# Or the whole stack in containers:
docker compose up --build

# Everyday Nx:
npx nx run-many -t serve                 # serve everything     (npm run dev)
npx nx build <project>                   # build one app/lib    (e.g. content-service)
npx nx test <project>                    # jest
npx nx lint <project>                    # eslint
npx nx affected -t build test lint       # only what changed
npx nx graph                             # visualize the dependency graph
```

RabbitMQ management UI: http://localhost:15672 (`orbit` / `orbit`).
Postgres: `localhost:5432` (`orbit` / `orbit`), databases `db_users`,
`db_content`, `db_chat`, `db_notifications`.

> **Never** use monolith-style commands (`npm run start:dev`). Everything runs
> through Nx; infrastructure runs through `docker compose`.

---

## 9. Deployment — Nginx + Kubernetes (concepts & rules — NOT configured yet)

Deployment is **defined here, wired later** (final phase). Nothing in `infra/nginx`
or `infra/k8s` is active. The rules:

### Nginx (reverse proxy + load balancer / API gateway)
- Single public edge on 80/443; **TLS terminated here**. **Routing only — no auth.**
- Routes **by URL** (see [`infra/nginx`](./infra/nginx)):
  `/api/users/* → users-service:3001`, `/api/posts/* → content-service:3002`,
  `/ws/chat/* → chat-service:3003` (WebSocket upgrade), `/* → orbit-frontend:3000`.
- Load-balances across each service's Kubernetes replicas.

### Docker images
- Each app is packaged as its **own image**: `orbit/<app>:<tag>` (e.g.
  `orbit/users-service:v2`), built multi-stage via Nx (`infra/docker`).
- On merge to `main`, CI builds and **pushes images to a registry** (Docker Hub / AWS ECR).

### Kubernetes
- **Deployments** hold desired replica counts of a specific image tag.
- **Auto-scaling (HPA):** rule-based, e.g. "content-service CPU > 70% → add 2 replicas".
- **Self-healing:** a crashed/OOM container is detected, destroyed, and replaced
  within seconds — no human intervention.
- **Services** give stable in-cluster DNS; **Ingress** encodes the same routing
  contract as Nginx; **rolling updates** ship new versions replica by replica.

The point of all this: **independent scalability + fault tolerance**.

---

## 10. Conventions & guardrails

- **English only.** The entire project is written in English — code, identifiers,
  comments, docs, commit messages, branch names, API routes, event names, and
  database tables/fields. No exceptions.
- **TypeScript everywhere**; strict mode on. Backend = NestJS 11, Frontend =
  Next.js (App Router) + React 19 + Tailwind v4.
- **Never** import another service's source; depend on `@orbit/*` libs.
- **Never** write raw cross-database SQL and **never** add a cross-database FK;
  cross-domain reads go through gRPC (API Composition) or RabbitMQ events.
- Keep each service's public surface **domain-oriented**.
- New shared contract? Add it to `libs/shared-types` first, then implement.
- New async event? Define its payload in `shared-types` and its
  exchange/queue convention in `libs/message-broker`; name it `domain.entity.action`.
- New auth rule? Put shared JWT/CASL logic in `libs/shared-auth`; evaluate locally.
- Prefer `nx affected` in CI; every project has `build` / `test` / `lint` targets.
- Secrets/config come from env (`.env` is gitignored); never commit credentials.

---

## 11. Working with the Graphify knowledge graph

A Graphify knowledge graph of this repo lives in `graphify-out/` (built from
domain source + architecture docs; Nx/TS config is excluded via
[`.graphifyignore`](./.graphifyignore)). When using it for context:

- **Don't trust global centrality blindly.** The highest-degree ("god") nodes
  are often config hubs (`compilerOptions`, `dependencies`), not real
  abstractions. Weigh nodes by domain relevance, not raw degree.
- **Ignore communities dominated by Nx/TS config** (tsconfig, package.json,
  build/test targets) unless the task is specifically about build/config.
- **Prioritize the architecture signal:** the *Orbit Architecture & Agent
  Delegation* community, the **hyperedges** (database-per-service, RabbitMQ event
  flow, Nginx routing), runtime flows, service boundaries, and domain modules.
- **Treat dangling-endpoint / unresolved semantic edges as low confidence** —
  same for nodes without a clear source file and edges to concepts that don't
  resolve to a node. Trust `EXTRACTED` edges; verify `INFERRED`/`AMBIGUOUS`.
- Refresh after doc/code changes with `graphify . --update` (incremental).

---

## 12. Orchestration

Claude is the orchestrator and **reads this file first**, then delegates each task
to the right skills/agents per [`AGENTS.md`](./AGENTS.md). CLAUDE.md answers
*what/where/why*; AGENTS.md answers *who/how*.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
