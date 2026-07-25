import { Module } from '@nestjs/common';
import { OrbitCommonModule } from '@orbit/nest-common';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [OrbitCommonModule.forRoot(), NotificationsModule],
})
export class AppModule {}
