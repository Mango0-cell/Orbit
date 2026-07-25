import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotifications1721200000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE "notifications" (
        "notification_id" SERIAL NOT NULL,
        "user_id" uuid NOT NULL,
        "type" varchar NOT NULL,
        "title" varchar NOT NULL,
        "body" text NOT NULL,
        "entity_type" varchar,
        "entity_id" varchar,
        "is_read" boolean NOT NULL DEFAULT false,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "read_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_notification_id" PRIMARY KEY ("notification_id")
      )
    `);
    await q.query(
      `CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")`,
    );
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "notifications"`);
  }
}
