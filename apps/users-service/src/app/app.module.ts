import { Module } from '@nestjs/common';
import { OrbitCommonModule } from '@orbit/nest-common';
import { UsersModule } from './users/users.module';

@Module({
  imports: [OrbitCommonModule.forRoot(), UsersModule],
})
export class AppModule {}
