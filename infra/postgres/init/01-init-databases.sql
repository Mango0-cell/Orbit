-- Orbit — local-dev database bootstrap.
--
-- Honors the "database per service" model: one logical database per service,
-- with NO cross-database joins. Services reach data they don't own via gRPC
-- (synchronous) or RabbitMQ events (asynchronous), never via SQL across DBs.
--
-- LOCAL DEV ONLY: for convenience these four databases live inside a single
-- PostgreSQL container. In production each one is a separate PostgreSQL
-- instance/cluster owned by exactly one service (see CLAUDE.md → Deployment).

CREATE DATABASE db_users;          -- users-service         → USERS, USERS_RELATION, THEME
CREATE DATABASE db_content;        -- content-service       → POSTS, COMMENTS, ATTACHMENTS, POST_REACTIONS, SAVED_POST
CREATE DATABASE db_chat;           -- chat-service          → DIRECT_CONVERSATIONS, DIRECT_MESSAGES
CREATE DATABASE db_notifications;  -- notifications-service → NOTIFICATIONS
