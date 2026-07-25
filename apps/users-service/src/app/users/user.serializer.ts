import {
  asProfile,
  readableProfileFields,
  FULL_PROFILE_FIELDS,
  type AppAbility,
} from '@orbit/shared-auth';
import type { OwnProfile, UserCard, UserProfile } from '@orbit/shared-types';
import { UserEntity } from './user.entity';

/** The caller's own full profile (adds private fields). */
export function toOwnProfile(u: UserEntity): OwnProfile {
  return { ...toProfile(u), email: u.email, settings: u.settings };
}

function toProfile(u: UserEntity): UserProfile {
  return {
    userId: u.user_id,
    tagName: u.tag_name,
    displayName: u.display_name,
    avatarUrl: u.profile_photo,
    accountType: u.account_type,
    bio: u.bio,
    job: u.job,
    location: u.location,
    websiteUrl: u.website_url,
    genre: u.genre,
    age: u.age,
    createdAt: u.created_at.toISOString(),
  };
}

function toCard(p: UserProfile): UserCard {
  return {
    userId: p.userId,
    tagName: p.tagName,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl,
    accountType: p.accountType,
    bio: p.bio,
  };
}

/**
 * Serialize a target user for a viewer, honoring the CASL Profile field-level policy:
 * full profile when the viewer may read a gated (full-profile) field — public account,
 * friend, or owner — otherwise the minimal card (which includes the public `bio`).
 */
export function serializeProfileFor(
  target: UserEntity,
  viewerId: string | null,
  ability: AppAbility,
): UserProfile | UserCard {
  const subject = asProfile({
    ownerId: target.user_id,
    accountType: target.account_type,
    // Follow graph is not built yet; the owner path is handled explicitly below.
    relationship: 'none',
    username: target.tag_name,
    displayName: target.display_name,
    avatarUrl: target.profile_photo ?? undefined,
    bio: target.bio ?? undefined,
    settings: target.settings,
  });
  const full = toProfile(target);
  // Owner always reads their own full profile (own-resource rule); everyone else reads it
  // only when the field-level policy permits a gated full-profile field (e.g. `location`).
  // `bio` is card-level and therefore always present, even on the card.
  const permitted = readableProfileFields(ability, subject);
  const canSeeFull =
    viewerId === target.user_id ||
    FULL_PROFILE_FIELDS.some((f) => permitted.includes(f));
  if (canSeeFull) {
    return full;
  }
  return toCard(full);
}
