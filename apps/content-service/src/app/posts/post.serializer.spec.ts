import 'reflect-metadata';
import { canView, toPostResponse } from './post.serializer';
import { PostEntity } from './post.entity';

function post(over: Partial<PostEntity> = {}): PostEntity {
  return Object.assign(
    new PostEntity(),
    {
      post_id: 'p1',
      user_id: 'u1',
      content: 'hello',
      visibility: 'public',
      created_at: new Date('2026-01-01T00:00:00Z'),
      updated_at: new Date('2026-01-02T00:00:00Z'),
    },
    over,
  );
}

describe('post.serializer', () => {
  it('toPostResponse maps the entity to the contract shape', () => {
    expect(toPostResponse(post())).toEqual({
      postId: 'p1',
      authorId: 'u1',
      content: 'hello',
      visibility: 'public',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
  });

  it('canView: a public post is visible to anyone, including a guest', () => {
    expect(canView(post({ visibility: 'public' }), null)).toBe(true);
    expect(canView(post({ visibility: 'public' }), 'other')).toBe(true);
  });

  it('canView: a private post is visible only to its author', () => {
    expect(canView(post({ visibility: 'private' }), 'u1')).toBe(true);
    expect(canView(post({ visibility: 'private' }), 'other')).toBe(false);
    expect(canView(post({ visibility: 'private' }), null)).toBe(false);
  });
});
