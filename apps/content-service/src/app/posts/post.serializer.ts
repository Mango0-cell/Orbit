import type { PostResponse } from '@orbit/shared-types';
import { PostEntity } from './post.entity';

export function toPostResponse(p: PostEntity): PostResponse {
  return {
    postId: p.post_id,
    authorId: p.user_id,
    content: p.content,
    visibility: p.visibility,
    createdAt: p.created_at.toISOString(),
    updatedAt: p.updated_at.toISOString(),
  };
}

/**
 * A post is visible to a viewer when it is public, or the viewer is its author.
 * Friend-based visibility of private posts requires the follow graph (db_users) and
 * is resolved over gRPC in the mesh phase — deferred here.
 */
export function canView(p: PostEntity, viewerId: string | null): boolean {
  return p.visibility === 'public' || p.user_id === viewerId;
}
