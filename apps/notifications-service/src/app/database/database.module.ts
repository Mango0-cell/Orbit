import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from '../notifications/notification.entity';

/** Owns the single isolated connection to `db_notifications`. No other database is touched. */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ??
        'postgres://orbit:orbit@localhost:5432/db_notifications',
      entities: [NotificationEntity],
      migrationsRun: false,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([NotificationEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
