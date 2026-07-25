import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../posts/post.entity';

/** Owns the single isolated connection to `db_content`. No other database is touched. */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ??
        'postgres://orbit:orbit@localhost:5432/db_content',
      entities: [PostEntity],
      migrationsRun: false,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([PostEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
