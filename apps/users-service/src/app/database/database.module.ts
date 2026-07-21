import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';

/** Owns the single isolated connection to `db_users`. No other database is touched. */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL ?? 'postgres://orbit:orbit@localhost:5432/db_users',
      entities: [UserEntity],
      migrationsRun: false,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
