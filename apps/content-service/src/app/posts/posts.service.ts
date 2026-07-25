import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './post.entity';
import type { CreatePostDto } from './dto/create-post.dto';
import type { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity) private readonly repo: Repository<PostEntity>,
  ) {}

  create(userId: string, dto: CreatePostDto): Promise<PostEntity> {
    const post = this.repo.create({
      user_id: userId,
      content: dto.content,
      visibility: dto.visibility ?? 'public',
    });
    return this.repo.save(post);
  }

  findById(postId: string): Promise<PostEntity | null> {
    return this.repo.findOne({ where: { post_id: postId } });
  }

  listByAuthor(userId: string, includePrivate: boolean): Promise<PostEntity[]> {
    return this.repo.find({
      where: includePrivate
        ? { user_id: userId }
        : { user_id: userId, visibility: 'public' },
      order: { created_at: 'DESC' },
    });
  }

  async updateOwn(
    userId: string,
    postId: string,
    dto: UpdatePostDto,
  ): Promise<PostEntity> {
    const post = await this.requireOwned(userId, postId);
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.visibility !== undefined) post.visibility = dto.visibility;
    return this.repo.save(post);
  }

  async deleteOwn(userId: string, postId: string): Promise<void> {
    const post = await this.requireOwned(userId, postId);
    await this.repo.remove(post);
  }

  private async requireOwned(
    userId: string,
    postId: string,
  ): Promise<PostEntity> {
    const post = await this.repo.findOne({ where: { post_id: postId } });
    if (!post) throw new NotFoundException();
    if (post.user_id !== userId) throw new ForbiddenException('Not your post');
    return post;
  }
}
