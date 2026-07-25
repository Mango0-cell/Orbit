import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePosts1721100000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE "posts" (
        "post_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "content" text NOT NULL,
        "visibility" varchar NOT NULL DEFAULT 'public',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_posts_post_id" PRIMARY KEY ("post_id")
      )
    `);
    await q.query(`CREATE INDEX "IDX_posts_user_id" ON "posts" ("user_id")`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "posts"`);
  }
}
