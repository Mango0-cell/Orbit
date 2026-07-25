import { DataSource } from 'typeorm';
import { PostEntity } from './app/posts/post.entity';

/** TypeORM CLI data source — used for `migration:run` / `migration:generate`, not the app runtime. */
export default new DataSource({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ??
    'postgres://orbit:orbit@localhost:5432/db_content',
  entities: [PostEntity],
  migrations: ['apps/content-service/src/migrations/*.ts'],
});
