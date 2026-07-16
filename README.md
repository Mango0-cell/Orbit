# Orbit

A **social network** built as a **microservices** system — isolated,
independently scalable services with fault isolation. Managed as an **Nx**
monorepo.

- **Frontend:** Next.js (App Router) · React 19 · TypeScript · Tailwind CSS v4
- **Backend:** NestJS 11 · TypeScript · PostgreSQL (database per service)
- **Comms:** REST (edge) · gRPC (sync backend-to-backend) · WebSockets (realtime) · RabbitMQ (async Pub/Sub)
- **Auth:** JWT + CASL (isomorphic ABAC) — **decentralized** in `@orbit/shared-auth`, verified locally per service (Nginx routes only, never authenticates)
- **Infra:** Docker / Docker Compose · (Nginx API gateway + Kubernetes in the deployment phase)

> **Project status:** the development *environment* is ready — workspace,
> service skeletons, shared libs, and the local Docker stack. Feature code,
> database schemas, gRPC contracts, and the deployment layer are the next
> phases. See **[`CLAUDE.md`](./CLAUDE.md)** for the full architecture and
> **[`AGENTS.md`](./AGENTS.md)** for how work is delegated.

---

## Architecture

```
Browser ──REST/WS──► Nginx (edge; deployment phase) ──► services
                                                         ├─ users-service     :3001  gRPC 50051  db_users
                                                         ├─ content-service   :3002  gRPC 50052  db_content
                                                         ├─ chat-service (WS)  :3003  gRPC 50053  db_chat
                                                         └─ notifications      :3004  gRPC 50054  db_notifications
services ──gRPC──► services            (synchronous, e.g. "is this profile public?")
services ──RabbitMQ──► services        (asynchronous side-effects: notifications, fan-out)
```

**Golden rules:** one database per service (no cross-DB joins); cross-domain data
over gRPC/events, never SQL; APIs organized by business domain, not tables.
Full detail in [`CLAUDE.md`](./CLAUDE.md).

## Repository layout

```
apps/
  orbit-frontend/          Next.js + React + Tailwind
  users-service/           NestJS — users, follow graph, themes
  content-service/         NestJS — posts, comments, reactions, saves
  chat-service/            NestJS — direct messaging (WebSockets)
  notifications-service/   NestJS — notifications (event consumer)
libs/
  shared-types/            @orbit/shared-types   — interfaces, DTOs, contract types
  message-broker/          @orbit/message-broker — RabbitMQ config + Pub/Sub helpers
  shared-auth/             @orbit/shared-auth    — JWT verify + CASL abilities (ABAC)
infra/
  docker/                  per-app Dockerfiles
  postgres/init/           creates the 4 dev databases
  nginx/                   routing contract + reference config (deployment phase)
  k8s/                     manifests placeholder (deployment phase)
docker-compose.yml         local dev stack
```

## Prerequisites

- **Node 22+** and **npm**
- **Docker** + Docker Compose

## Getting started

```bash
npm install
```

### Fastest inner loop (recommended)

Run only the backing services in Docker, and the apps with Nx hot-reload:

```bash
docker compose up postgres rabbitmq         # Postgres (+ 4 DBs) and RabbitMQ
npx nx serve users-service                  # or content-service / chat-service / notifications-service
npx nx serve orbit-frontend                 # http://localhost:3000
```

### Full stack in containers

```bash
docker compose up --build                   # all services + frontend + backing services
```

- Frontend: http://localhost:3000
- Services: `:3001` users · `:3002` content · `:3003` chat (WS) · `:3004` notifications
- RabbitMQ UI: http://localhost:15672 (`orbit` / `orbit`)
- Postgres: `localhost:5432` (`orbit` / `orbit`) — `db_users`, `db_content`, `db_chat`, `db_notifications`

## Everyday commands

```bash
npx nx serve <project>                 # run a service/app in dev
npx nx build <project>                 # build one project
npx nx test <project>                  # jest
npx nx lint <project>                  # eslint
npx nx affected -t build test lint     # only what changed (use in CI)
npx nx graph                           # visualize the dependency graph
npx nx show projects                   # list all projects

# scaffolding — always via Nx generators:
npx nx g @nx/nest:application apps/<name>
npx nx g @nx/js:library libs/<name> --importPath=@orbit/<name>
```

Import shared code with the `@orbit/*` scope, e.g.
`import { UserDto } from '@orbit/shared-types';`.

## Deployment

Nginx (reverse proxy / load balancer) and Kubernetes (Deployments, autoscaling,
self-healing) are **defined but not configured yet** — that's the final phase.
The rules and routing contract live in [`CLAUDE.md`](./CLAUDE.md) and
[`infra/`](./infra). Each app builds to its own image (`orbit/<app>:<tag>`)
pushed to a registry by CI on merge to `main`.
