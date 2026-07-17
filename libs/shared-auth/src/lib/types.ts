/**
 * Core authorization types for Orbit. Shared (isomorphic) across every service and,
 * later, the frontend. See docs/superpowers/specs/2026-07-16-orbit-authorization-policies-design.md
 */

export type AccountType = 'public' | 'private';

/**
 * Relationship of the VIEWER to the OWNER of a resource, derived from the follow graph:
 * - `none`     — no follow either way
 * - `follower` — viewer follows owner, NOT mutual
 * - `friend`   — mutual follow
 */
export type Relationship = 'none' | 'follower' | 'friend';

/**
 * Per-account privacy toggles for PRIVATE accounts. All default to `true`; the strict
 * lock-out of non-friends is always enforced by the policy and is not a toggle.
 */
export interface PrivateSettings {
  /** Friends may see the owner's posts. */
  postsVisibleToFriends: boolean;
  /** Friends may comment on the owner's posts. */
  allowFriendComments: boolean;
  /** Friends may react to / share the owner's posts. */
  allowFriendReactions: boolean;
  /** Followers (not yet friends) may send a message request. */
  allowFollowerMessageRequests: boolean;
}

/** The authenticated principal (subset of the verified JWT payload). */
export interface AuthUser {
  id: string;
  accountType: AccountType;
}

/** A viewer is either authenticated or an unauthenticated guest (`null`). */
export type Viewer = AuthUser | null;

/** A user profile as seen by a viewer. */
export interface ProfileSubject {
  ownerId: string;
  accountType: AccountType;
  relationship: Relationship;
  /** Present for private owners. */
  settings?: PrivateSettings;
  // Card fields (readable by anyone):
  username: string;
  displayName: string;
  avatarUrl?: string;
  // Full-profile fields (gated):
  bio?: string;
}

/** A post as seen by a viewer. */
export interface PostSubject {
  postId: string;
  ownerId: string;
  ownerAccountType: AccountType;
  relationship: Relationship;
  /** Present for private owners. */
  ownerSettings?: PrivateSettings;
}

/** An intended direct message to a recipient, as seen by the sender (viewer). */
export interface DirectMessageSubject {
  recipientId: string;
  recipientAccountType: AccountType;
  relationship: Relationship;
  /** Present for private recipients. */
  recipientSettings?: PrivateSettings;
}

/** A user's own account settings. */
export interface AccountSettingsSubject {
  ownerId: string;
}
