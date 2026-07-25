import { DataSource } from 'typeorm';
import { NotificationEntity } from './app/notifications/notification.entity';

/** TypeORM CLI data source — used for `migration:run` / `migration:generate`, not the app runtime. */
export default new DataSource({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ??
    'postgres://orbit:orbit@localhost:5432/db_notifications',
  entities: [NotificationEntity],
  migrations: ['apps/notifications-service/src/migrations/*.ts'],
});
