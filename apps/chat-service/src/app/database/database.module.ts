import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from '../chat/conversation.entity';
import { MessageEntity } from '../chat/message.entity';

/** Owns the single isolated connection to `db_chat`. No other database is touched. */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ??
        'postgres://orbit:orbit@localhost:5432/db_chat',
      entities: [ConversationEntity, MessageEntity],
      migrationsRun: false,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([ConversationEntity, MessageEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
