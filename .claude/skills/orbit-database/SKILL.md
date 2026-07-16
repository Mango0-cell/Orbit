---
name: orbit-database
description: Design a TypeORM entity and migration for a service's OWN database in Orbit (db_users, db_content, db_chat, db_notifications). Use when adding or changing a table or column. Enforces database-per-service — no foreign keys across databases; cross-domain ids are logical references. Trigger words: new entity, schema, migration, TypeORM, table, column.
---

# orbit-database — entity + migration (database per service)

Read `CLAUDE.md §5` (data model) first. Invoke `ecc:postgres-patterns` and
`ecc:database-migrations`; review with `ecc:database-reviewer`.

## Rules
- Model **only** tables owned by the current service's database. One isolated
  connection per service.
- **No SQL foreign keys across databases.** A `user_id` in `db_content` / `db_chat` /
  `db_notifications` is a **logical reference** (plain indexed column), validated via
  gRPC or kept in sync via events. In-database FKs (e.g. COMMENTS → POSTS) are fine.
- `timestamptz` for every timestamp; `created_at` / `updated_at` on mutable tables.
- Match the schema in `CLAUDE.md §5` (USERS, USERS_RELATION, THEME, POSTS, COMMENTS,
  ATTACHMENTS, POST_REACTIONS, SAVED_POST, DIRECT_CONVERSATIONS, DIRECT_MESSAGES, NOTIFICATIONS).
- **English** identifiers.

## Steps
1. Define the TypeORM entity under `apps/<svc>/src/app/<domain>/entities/`.
2. Generate a migration via a TypeORM CLI wrapped in an Nx target. **Never**
   `synchronize: true` outside throwaway local runs.
3. Add indexes for logical-reference columns and hot query paths.
4. Write a repository/data-access test; run it against local Postgres (`docker compose up postgres`).
5. `ecc:database-reviewer` pass.

## Definition of Done
Migration is reversible · no cross-DB FK · indexes present · timestamps `timestamptz` ·
reviewer approved. **Do not push.**
