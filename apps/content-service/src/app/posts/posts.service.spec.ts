import 'reflect-metadata';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostEntity } from './post.entity';

function post(over: Partial<PostEntity> = {}): PostEntity {
  return Object.assign(
    new PostEntity(),
    {
      post_id: 'p1',
      user_id: 'u1',
      content: 'hi',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
    },
    over,
  );
}

function make(repoOver: Record<string, unknown> = {}) {
  const repo = {
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => ({ ...x, post_id: 'p1' })),
    findOne: jest.fn(),
    find: jest.fn(async () => []),
    remove: jest.fn(async () => undefined),
    ...repoOver,
  };
  const service = new PostsService(repo as never);
  return { service, repo };
}

describe('PostsService', () => {
  it('create defaults visibility to public and stamps the author', async () => {
    const { service, repo } = make();
    await service.create('u1', { content: 'hi' });
    expect(repo.create).toHaveBeenCalledWith({
      user_id: 'u1',
      content: 'hi',
      visibility: 'public',
    });
    expect(repo.save).toHaveBeenCalled();
  });

  it('updateOwn rejects a non-author with 403', async () => {
    const { service } = make({
      findOne: jest.fn(async () => post({ user_id: 'someone-else' })),
    });
    await expect(
      service.updateOwn('u1', 'p1', { content: 'x' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updateOwn 404s a missing post', async () => {
    const { service } = make({ findOne: jest.fn(async () => null) });
    await expect(service.updateOwn('u1', 'nope', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updateOwn patches only provided fields for the author', async () => {
    const { service, repo } = make({ findOne: jest.fn(async () => post()) });
    const out = await service.updateOwn('u1', 'p1', { visibility: 'private' });
    expect(out.visibility).toBe('private');
    expect(out.content).toBe('hi');
    expect(repo.save).toHaveBeenCalled();
  });

  it('listByAuthor filters to public posts when the viewer is not the owner', async () => {
    const { service, repo } = make();
    await service.listByAuthor('u1', false);
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: 'u1', visibility: 'public' },
      }),
    );
  });
});
