import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Authenticated, CurrentUser } from '@orbit/nest-common';
import type { AuthUser } from '@orbit/shared-auth';
import type { PostResponse } from '@orbit/shared-types';
import { PostsService } from './posts.service';
import { canView, toPostResponse } from './post.serializer';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller()
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Authenticated()
  @Post('posts')
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePostDto,
  ): Promise<PostResponse> {
    return toPostResponse(await this.posts.create(user.id, dto));
  }

  @Get('posts/:id')
  async getOne(
    @Param('id') id: string,
    @CurrentUser() viewer: AuthUser | null,
  ): Promise<PostResponse> {
    const post = await this.posts.findById(id);
    // Hide private posts from non-authors behind a 404 (don't reveal existence).
    if (!post || !canView(post, viewer?.id ?? null))
      throw new NotFoundException();
    return toPostResponse(post);
  }

  @Get('users/:userId/posts')
  async listByUser(
    @Param('userId') userId: string,
    @CurrentUser() viewer: AuthUser | null,
  ): Promise<PostResponse[]> {
    const posts = await this.posts.listByAuthor(userId, viewer?.id === userId);
    return posts.map(toPostResponse);
  }

  @Authenticated()
  @Patch('posts/:id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ): Promise<PostResponse> {
    return toPostResponse(await this.posts.updateOwn(user.id, id, dto));
  }

  @Authenticated()
  @Delete('posts/:id')
  @HttpCode(204)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.posts.deleteOwn(user.id, id);
  }
}
