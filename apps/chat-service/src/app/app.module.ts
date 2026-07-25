import { Module } from '@nestjs/common';
import { OrbitCommonModule } from '@orbit/nest-common';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [OrbitCommonModule.forRoot(), ChatModule],
})
export class AppModule {}
