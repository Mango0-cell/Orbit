/** Content-domain contract types (posts). Framework-agnostic; shared across services. */

export type PostVisibility = 'public' | 'private';

/**
 * A post as returned by content-service. `authorId` is a **logical** reference to a user
 * owned by db_users (no cross-database FK — resolved via gRPC/events when needed).
 */
export interface PostResponse {
  postId: string;
  authorId: string;
  content: string;
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;
}
