import type { PrivateSettings } from './types.js';

/**
 * Strict baseline for a NEW private account: friends get full access by default, and
 * non-friends are always locked out (that lock-out is enforced by the policy, not a toggle).
 * A private account starts with every toggle enabled and may relax them individually later.
 */
export function defaultPrivateSettings(): PrivateSettings {
  return {
    postsVisibleToFriends: true,
    allowFriendComments: true,
    allowFriendReactions: true,
    allowFollowerMessageRequests: true,
  };
}
