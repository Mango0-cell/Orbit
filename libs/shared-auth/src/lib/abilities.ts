import { AbilityBuilder, createMongoAbility, type ForcedSubject, type MongoAbility } from '@casl/ability';
import { permittedFieldsOf } from '@casl/ability/extra';
import type {
  AccountSettingsSubject,
  DirectMessageSubject,
  PostSubject,
  ProfileSubject,
  Viewer,
} from './types.js';

export type Actions =
  | 'read'
  | 'react'
  | 'comment'
  | 'share'
  | 'message'
  | 'request-message'
  | 'follow'
  | 'manage';

export type SubjectName = 'Profile' | 'Post' | 'DirectMessage' | 'AccountSettings';

/** Subjects may be referenced by name (in rules) or as a tagged object (in checks). */
type AppSubjects =
  | SubjectName
  | (ProfileSubject & ForcedSubject<'Profile'>)
  | (PostSubject & ForcedSubject<'Post'>)
  | (DirectMessageSubject & ForcedSubject<'DirectMessage'>)
  | (AccountSettingsSubject & ForcedSubject<'AccountSettings'>);

export type AppAbility = MongoAbility<[Actions, AppSubjects]>;

/** Profile fields ANY viewer (including guests) may read — the "minimal card". */
export const CARD_FIELDS = ['username', 'displayName', 'avatarUrl', 'accountType'] as const;

/** Every Profile field the policy can grant read on (minimal card + gated full-profile fields). */
export const PROFILE_READ_FIELDS = [...CARD_FIELDS, 'bio'] as const;

/**
 * The Profile fields a viewer may read, per the field-level CASL policy. Rules that name
 * fields (the card rule) contribute exactly those; rules without fields (public / owner /
 * friend) grant every {@link PROFILE_READ_FIELDS} entry. Consumers render the full profile
 * when a gated field (e.g. `bio`) is permitted, otherwise the minimal card.
 */
export function readableProfileFields(ability: AppAbility, profileSubject: ProfileSubject): string[] {
  // `profileSubject` must be tagged via asProfile() so CASL resolves it as 'Profile' at runtime.
  return permittedFieldsOf(ability, 'read', profileSubject as never, {
    fieldsFrom: (rule) => rule.fields ?? [...PROFILE_READ_FIELDS],
  });
}

/** A viewer is a guest when there is no authenticated principal. */
export function isGuest(viewer: Viewer): viewer is null {
  return viewer == null;
}

/**
 * Build the CASL ability for a viewer. `null` = unauthenticated guest.
 *
 * Isomorphic ABAC: rules match attributes carried on each subject (ownerAccountType,
 * relationship, owner settings) — see ./subjects. Everything not granted here is denied
 * by default. Reusable in NestJS guards and, later, the frontend.
 */
export function defineAbilitiesFor(viewer: Viewer): AppAbility {
  const { can: rawCan, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // CASL's typed builder can't express our attribute/nested conditions on string-named
  // subjects, so we widen the signature. Correctness is guaranteed by the test matrix
  // (abilities.spec.ts); runtime matching is unaffected.
  const can = rawCan as (
    action: Actions | Actions[],
    subject: SubjectName,
    fieldsOrConditions?: unknown,
    conditions?: unknown,
  ) => void;

  // ---- Reads available to EVERYONE, including unauthenticated guests ----
  can('read', 'Profile', [...CARD_FIELDS]);          // minimal card of any account
  can('read', 'Profile', { accountType: 'public' }); // full public profile (all fields)
  can('read', 'Post', { ownerAccountType: 'public' }); // public posts

  if (isGuest(viewer)) {
    // Guests browse public content read-only: no interaction, no follow.
    return build();
  }

  // ---- Own resources (full rights regardless of account type) ----
  can('manage', 'AccountSettings', { ownerId: viewer.id });
  can('read', 'Profile', { ownerId: viewer.id });
  can(['read', 'react', 'comment', 'share'], 'Post', { ownerId: viewer.id });

  // ---- Private full profile / posts → friends only ----
  can('read', 'Profile', { accountType: 'private', relationship: 'friend' });
  can('read', 'Post', {
    ownerAccountType: 'private',
    relationship: 'friend',
    'ownerSettings.postsVisibleToFriends': true,
  });

  // ---- Interactions on PUBLIC posts (any authenticated user) ----
  can(['react', 'comment', 'share'], 'Post', { ownerAccountType: 'public' });

  // ---- Interactions on PRIVATE posts (friends + owner toggles) ----
  can(['react', 'share'], 'Post', {
    ownerAccountType: 'private',
    relationship: 'friend',
    'ownerSettings.allowFriendReactions': true,
  });
  can('comment', 'Post', {
    ownerAccountType: 'private',
    relationship: 'friend',
    'ownerSettings.allowFriendComments': true,
  });

  // ---- Direct messages ----
  // Public: a follower (or friend, who is also a follower) may DM directly.
  can('message', 'DirectMessage', {
    recipientAccountType: 'public',
    relationship: { $in: ['follower', 'friend'] },
  });
  // Private: friends DM directly; followers may send a request (owner accepts/declines).
  can('message', 'DirectMessage', {
    recipientAccountType: 'private',
    relationship: 'friend',
  });
  can('request-message', 'DirectMessage', {
    recipientAccountType: 'private',
    relationship: 'follower',
    'recipientSettings.allowFollowerMessageRequests': true,
  });

  // ---- Follow (open follow: any authenticated user may follow anyone) ----
  can('follow', 'Profile');

  return build();
}
