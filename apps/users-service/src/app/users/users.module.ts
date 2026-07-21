import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PasswordService } from './password.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController, UsersController],
  providers: [UsersService, PasswordService],
})
export class UsersModule {}
