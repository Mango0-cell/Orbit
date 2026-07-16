---
name: orbit-feature
description: Orchestrate a full vertical feature across Orbit (backend service + database + gRPC/events + auth + frontend) by sequencing the orbit-* skills along the AGENTS.md workflow spine. Use for any end-to-end feature spanning more than one layer, e.g. "follow a user", "create a post with reactions", "direct messaging", "live notifications". Trigger words: feature, end-to-end, vertical slice, build X across services, whole flow.
---

# orbit-feature — end-to-end feature orchestrator

The conductor. Read `CLAUDE.md` (architecture) and `AGENTS.md` (delegation) first. This skill
decomposes a feature and routes each slice to the specialized `orbit-*` skills, following the
AGENTS.md spine: **brainstorm → plan → (worktree?) → TDD implement → review → verify**.

## Procedure
1. **Brainstorm** (`superpowers:brainstorming`) → approved design. Identify which services,
   databases, contracts, events, and Stitch screens the feature touches.
2. **Plan** (`superpowers:writing-plans` / `ecc:planner`): one slice per layer, ordered by dependency.
3. **Contracts first:** add DTOs / event payloads / gRPC contracts to `@orbit/shared-types`
   (+ `@orbit/message-broker` conventions) **before** any implementation.
4. **Backend slices** (per owning service):
   `orbit-database` → `orbit-service` → `orbit-grpc` (sync deps) / `orbit-events` (async side-effects)
   → `orbit-auth` (protect).
5. **Frontend slice:** `orbit-frontend` — port the Stitch screen, wire to the new endpoints.
6. **Parallelize** independent slices with `superpowers:dispatching-parallel-agents` +
   `superpowers:using-git-worktrees` when it is safe (no shared state).
7. **Review & verify:** the domain reviewer agent per slice; `superpowers:verification-before-completion`;
   `npx nx affected -t build test lint` green.

## Guardrails (reject violations — AGENTS.md §4)
database-per-service · domain-oriented APIs · contracts in `shared-types` · right protocol per job ·
tests first · run through Nx · **English only** · deployment deferred · **do not push**.

## Definition of Done
Design approved · every slice tested & reviewed · contracts updated · `nx affected` green ·
verified running. Hand off to the human to push.
