import { DataSource } from 'typeorm';
import { UserEntity } from './app/users/user.entity';

/** TypeORM CLI data source — used for `migration:run` / `migration:generate`, not the app runtime. */
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgres://orbit:orbit@localhost:5432/db_users',
  entities: [UserEntity],
  migrations: ['apps/users-service/src/migrations/*.ts'],
});
