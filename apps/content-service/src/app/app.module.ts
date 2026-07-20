import { Module } from '@nestjs/common';
import { OrbitCommonModule } from '@orbit/nest-common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [OrbitCommonModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
