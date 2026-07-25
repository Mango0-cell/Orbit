import { DataSource } from 'typeorm';
import { ConversationEntity } from './app/chat/conversation.entity';
import { MessageEntity } from './app/chat/message.entity';

/** TypeORM CLI data source — used for `migration:run` / `migration:generate`, not the app runtime. */
export default new DataSource({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ?? 'postgres://orbit:orbit@localhost:5432/db_chat',
  entities: [ConversationEntity, MessageEntity],
  migrations: ['apps/chat-service/src/migrations/*.ts'],
});
