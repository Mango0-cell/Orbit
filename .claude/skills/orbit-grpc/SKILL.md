---
name: orbit-grpc
description: Define and implement a synchronous backend-to-backend gRPC call in Orbit (API Composition), e.g. content-service asking users-service "is this profile public?" before returning posts. Use when one service needs another's data in-request. The contract lives in @orbit/shared-types. Trigger words: gRPC, sync call, API composition, cross-service read, proto, backend-to-backend.
---

# orbit-grpc — synchronous backend-to-backend (API Composition)

Read `CLAUDE.md §6` (comms). Invoke `ecc:nestjs-patterns` (microservices/transport) + `ecc:api-design`.

## When to use
A service needs another domain's data **during** a request (low-latency, must-have-now).
If the data can be eventual/reactive, use `orbit-events` instead.

## Rules
- The proto/contract + generated TS interfaces live in `@orbit/shared-types` — shared,
  never duplicated per service.
- gRPC ports: users **50051**, content **50052**, chat **50053**, notifications **50054**.
  Targets come from env (`*_GRPC_URL`, e.g. `USERS_GRPC_URL`); a service binds its own on `GRPC_URL`.
- The provider exposes a NestJS gRPC microservice; the consumer uses a typed client.
  Keep methods domain-oriented and minimal.
- **Never** use gRPC to mutate another service's DB — read/compose only.

## Steps
1. Define the service + messages in `libs/shared-types` (proto or TS contract).
2. Provider: implement `@GrpcMethod` handlers in the owning service, bound on `GRPC_URL`.
3. Consumer: register the gRPC client (`ClientsModule`) with the target from env; call
   using types from `shared-types`.
4. Handle failures (timeout, `UNAVAILABLE`) gracefully — the caller must degrade, not hang.
5. TDD the handler + client; `ecc:typescript-reviewer`.

## Definition of Done
Contract in `shared-types` · typed both sides · timeouts/errors handled · read-only ·
tests green. **Do not push.**
