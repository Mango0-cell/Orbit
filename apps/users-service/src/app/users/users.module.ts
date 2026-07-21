import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PasswordService } from './password.service';
import { EVENT_BUS, UserEventsPublisher } from '../events/user-events.publisher';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController, UsersController],
  providers: [
    UsersService,
    PasswordService,
    UserEventsPublisher,
    // No-op bus until the broker phase wires the amqp-backed publisher.
    { provide: EVENT_BUS, useValue: { publish: async () => undefined } },
  ],
})
export class UsersModule {}
