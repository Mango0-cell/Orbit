import { Module } from '@nestjs/common';
import { OrbitCommonModule } from '@orbit/nest-common';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [OrbitCommonModule.forRoot(), DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
