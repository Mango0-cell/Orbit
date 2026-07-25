import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChat1721300000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE "direct_conversations" (
        "conversation_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_1_id" uuid NOT NULL,
        "user_2_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_direct_conversations" PRIMARY KEY ("conversation_id")
      )
    `);
    await q.query(
      `CREATE UNIQUE INDEX "UQ_direct_conversations_pair" ON "direct_conversations" ("user_1_id", "user_2_id")`,
    );
    await q.query(`
      CREATE TABLE "direct_messages" (
        "message_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "conversation_id" uuid NOT NULL,
        "sender_user_id" uuid NOT NULL,
        "receiver_user_id" uuid NOT NULL,
        "message_body" text NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_direct_messages" PRIMARY KEY ("message_id"),
        CONSTRAINT "FK_direct_messages_conversation" FOREIGN KEY ("conversation_id")
          REFERENCES "direct_conversations" ("conversation_id") ON DELETE CASCADE
      )
    `);
    await q.query(
      `CREATE INDEX "IDX_direct_messages_conversation_id" ON "direct_messages" ("conversation_id")`,
    );
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "direct_messages"`);
    await q.query(`DROP TABLE "direct_conversations"`);
  }
}
