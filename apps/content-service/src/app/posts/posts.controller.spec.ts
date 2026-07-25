import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { PostsController } from './posts.controller';
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

describe('PostsController', () => {
  it('create delegates to the service with the caller id', async () => {
    const posts = { create: jest.fn(async () => post()) };
    const ctrl = new PostsController(posts as never);
    const res = await ctrl.create(
      { id: 'u1', accountType: 'public' },
      { content: 'hi' },
    );
    expect(posts.create).toHaveBeenCalledWith('u1', { content: 'hi' });
    expect(res.authorId).toBe('u1');
  });

  it('getOne hides a private post from a non-author behind a 404', async () => {
    const posts = {
      findById: jest.fn(async () =>
        post({ visibility: 'private', user_id: 'owner' }),
      ),
    };
    const ctrl = new PostsController(posts as never);
    await expect(
      ctrl.getOne('p1', { id: 'intruder', accountType: 'public' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('getOne returns a public post to a guest', async () => {
    const posts = {
      findById: jest.fn(async () => post({ visibility: 'public' })),
    };
    const ctrl = new PostsController(posts as never);
    const res = await ctrl.getOne('p1', null);
    expect(res.postId).toBe('p1');
  });
});
