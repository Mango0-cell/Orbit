import { Module } from '@nestjs/common';
import { OrbitCommonModule } from '@orbit/nest-common';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [OrbitCommonModule.forRoot(), PostsModule],
})
export class AppModule {}
