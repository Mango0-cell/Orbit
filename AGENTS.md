# AGENTS.md — how work gets delegated on Orbit

`CLAUDE.md` is the *what/where/why* of Orbit. **This file is the *who/how*:** it
tells the orchestrator (Claude) which **skills**, **agents**, and **rules** own
each kind of task. Read `CLAUDE.md` first, then use this to route the work.

> Convention: `superpowers:*`, `ecc:*`, `vercel:*`, `frontend-design:*`,
> `ui-ux-pro-max:*` are **skills** (invoke with the Skill tool). Names like
> `ecc:architect`, `ecc:code-reviewer`, `Explore`, `Plan` are **subagents**
> (launch with the Agent tool). If a named skill/agent isn't installed, fall
> back to the closest available one and note the substitution.

---

## 1. The workflow spine (every non-trivial change)

```
brainstorm ──► plan ──► (worktree?) ──► TDD implement ──► review ──► verify ──► done
```

1. **Brainstorm** — `superpowers:brainstorming` before any feature/behavior change.
   Produces an approved design. Skip only for mechanical edits.
2. **Plan** — `superpowers:writing-plans` (or the `ecc:planner` / `Plan` agent) to
   turn the design into ordered, testable steps.
3. **Isolate (optional)** — `superpowers:using-git-worktrees` for parallelizable
   or risky work; `superpowers:dispatching-parallel-agents` for 2+ independent tasks.
4. **Implement test-first** — `superpowers:test-driven-development` (red → green →
   refactor). Backend uses Jest; frontend uses Jest + Testing Library.
5. **Review** — `superpowers:requesting-code-review` + the domain reviewer agent
   (below). Treat feedback with `superpowers:receiving-code-review`.
6. **Verify** — `superpowers:verification-before-completion`: run build/test/lint
   and confirm behavior **before** claiming done.

---

## 2. Domain ownership → skills & agents

| Domain / task | Orbit skill | Primary skills | Reviewer / helper agent |
| ------------- | ----------- | -------------- | ----------------------- |
| **Overall architecture, service boundaries, new cross-cutting features** | `orbit-feature` | `superpowers:brainstorming`, `ecc:hexagonal-architecture`, `ecc:api-design` | `ecc:architect`, `Plan` |
| **NestJS services** (users / content / chat / notifications) | `orbit-service` | `ecc:nestjs-patterns`, `ecc:backend-patterns`, `ecc:api-design` | `ecc:typescript-reviewer` |
| **Database per service** (schemas, TypeORM entities, migrations) | `orbit-database` | `ecc:postgres-patterns`, `ecc:database-migrations` | `ecc:database-reviewer` |
| **gRPC (sync backend-to-backend)** | `orbit-grpc` | `ecc:nestjs-patterns` (microservices/transport), `ecc:api-design` | `ecc:typescript-reviewer` |
| **RabbitMQ (async Pub/Sub events)** | `orbit-events` | `ecc:backend-patterns`, `ecc:mcp-server-patterns` (patterns only) | `ecc:typescript-reviewer` |
| **Shared contracts** (`@orbit/shared-types`, `@orbit/message-broker`, `@orbit/shared-auth`) | — (via `orbit-grpc` / `orbit-events` / `orbit-service`) | `ecc:coding-standards`, `ecc:api-design` | `ecc:typescript-reviewer` |
| **Auth (JWT + CASL ABAC)** — decentralized, in `@orbit/shared-auth`, evaluated locally per service | `orbit-auth` | `ecc:security-review`, `ecc:nestjs-patterns` | `ecc:security-reviewer` |
| **Frontend** (Next.js + React 19 + Tailwind v4) | `orbit-frontend` | `frontend-design:frontend-design`, `ui-ux-pro-max:ui-ux-pro-max`, `vercel:nextjs`, `vercel:react-best-practices`, `vercel:shadcn` | `ecc:typescript-reviewer` |
| **Docker / images** | — | `ecc:docker-patterns` | `ecc:code-reviewer` |
| **Deployment: Nginx + Kubernetes** (final phase) | — | `ecc:deployment-patterns`, `vercel:deployments-cicd` | `ecc:architect` |
| **Security** (authn/z, input, secrets, PII) | `orbit-auth` | `ecc:security-review` | `ecc:security-reviewer` |
| **Performance** (queries, hot paths, bundle) | — | — | `ecc:performance-optimizer` |
| **Build/type errors** | — | — | `ecc:build-error-resolver` |
| **E2E / user flows** | — | `ecc:e2e-testing`, `agent-browser:agent-browser` | `ecc:e2e-runner` |
| **Docs / codemaps** | — | — | `ecc:doc-updater` |
| **Git & PRs** | — | `ecc:git-workflow`, `ecc:github-ops` | — |
| **Broad code search / "where is X"** | — | — | `Explore` |

> The **Orbit skill** column points to the project playbook in `.claude/skills/`.
> `orbit-feature` orchestrates the six domain skills end-to-end (per the spine in §1);
> each `orbit-*` skill self-triggers by its description and composes the library skills
> in the columns beside it — those skill files remain the single source of the "how".

---

## 3. Task routing — quick reference

- **"Add/extend a service feature"** → brainstorm → plan → `ecc:nestjs-patterns` +
  `superpowers:test-driven-development` → `ecc:database-reviewer` if it touches a
  schema → `ecc:typescript-reviewer`. If it needs another domain's data, add a
  **gRPC** call (never a cross-DB query) and, for side-effects, a **RabbitMQ** event.
- **"Build a UI screen/component"** → `frontend-design:frontend-design` (aesthetic
  direction) → `ui-ux-pro-max` + `vercel:nextjs`/`react-best-practices` → wire to
  services via REST/WS base URLs from env.
- **"Fix a bug / failing test"** → `superpowers:systematic-debugging` **first**
  (reproduce before fixing), then the relevant domain skill.
- **"Design the message schema / event"** → define payload in `@orbit/shared-types`,
  exchange/queue convention in `@orbit/message-broker`, then implement producer/consumer.
- **"Scaffold a new app/lib/module"** → use **Nx generators** (`nx g @nx/nest:*`,
  `@nx/next:*`, `@nx/js:library`) — never hand-author project config.
- **"Wire deployment"** (final phase only) → `ecc:deployment-patterns` for K8s
  Deployments/Services/HPA/Ingress + finalize `infra/nginx` and `infra/k8s`.

---

## 4. Guardrails (reject work that violates these)

1. **Database-per-service.** No cross-database joins; no importing another
   service's entities. Cross-domain data → gRPC (sync) or RabbitMQ (async).
2. **Domain-oriented APIs.** Routes model business concepts, not tables.
3. **Contracts live in `shared-types`.** Duplicated DTOs across services = reject.
4. **Right protocol for the job** (REST edge / gRPC sync / WS realtime / MQ async).
5. **Tests first.** New behavior ships with tests; `nx affected -t test lint`
   must be green.
6. **Run through Nx.** `nx build/test/lint/serve`, not raw tooling.
7. **No secrets in git.** Config via env; `.env*` is ignored.
8. **Deployment stays deferred** until the final phase — don't prematurely wire
   Nginx/K8s.
9. **English only.** All code, identifiers, comments, docs, commit messages, and
   branch names are written in English — reject any non-English contribution.

---

## 5. Definition of Done

A change is done only when: design was approved (for features) · behavior is
covered by passing tests · `nx affected -t build test lint` is green · a domain
reviewer agent has reviewed it · contracts that changed were updated in
`shared-types` · and `superpowers:verification-before-completion` confirms it
runs. **Do not push** — leave changes for the human to push unless explicitly
asked.

---

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
