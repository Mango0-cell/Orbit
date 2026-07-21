import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1721000000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE "users" (
        "user_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL,
        "password" varchar NOT NULL,
        "tag_name" varchar NOT NULL,
        "display_name" varchar NOT NULL,
        "bio" varchar,
        "job" varchar,
        "location" varchar,
        "website_url" varchar,
        "profile_photo" varchar,
        "genre" varchar,
        "age" integer,
        "account_type" varchar NOT NULL DEFAULT 'public',
        "settings" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_user_id" PRIMARY KEY ("user_id")
      )
    `);
    await q.query(`CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")`);
    await q.query(`CREATE UNIQUE INDEX "UQ_users_tag_name" ON "users" ("tag_name")`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "users"`);
  }
}
