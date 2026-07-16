---
name: orbit-events
description: Define an asynchronous RabbitMQ Pub/Sub domain event in Orbit (e.g. user.profile.updated, post.created, user.followed) and its producer/consumer. Use for decoupled side-effects — notifications, fan-out, counters. Payload goes in @orbit/shared-types; exchange/queue conventions in @orbit/message-broker. Trigger words: event, RabbitMQ, pub/sub, async, notification side-effect, fan-out, consumer, producer.
---

# orbit-events — asynchronous RabbitMQ Pub/Sub

Read `CLAUDE.md §6` (comms). Invoke `ecc:backend-patterns`.

## When to use
A service announces a **state change** that others react to, decoupled — the original
request must **not** wait on it. For in-request data, use `orbit-grpc`.

## Rules
- Event name = `domain.entity.action` (e.g. `user.profile.updated`, `post.created`, `user.followed`).
- Payload interface → `@orbit/shared-types`. Exchange/queue naming + connection helpers →
  `@orbit/message-broker`.
- **Fire-and-forget:** the producer must not know its consumers. No coupling.
- Consumers are **idempotent** (events may be redelivered). `notifications-service`
  consumes most events.
- Broker URL from `RABBITMQ_URL` env.

## Steps
1. Define the event payload interface in `libs/shared-types`.
2. Add the exchange/queue/binding convention + publish/subscribe helper in `libs/message-broker`.
3. Producer: publish **after** the local transaction commits.
4. Consumer: bind a queue, handle idempotently, ack/nack correctly (dead-letter on repeated failure).
5. TDD producer + consumer (mock the broker); `ecc:typescript-reviewer`.

## Definition of Done
Payload in `shared-types` · convention in `message-broker` · idempotent consumer ·
producer doesn't block the request · tests green. **Do not push.**
