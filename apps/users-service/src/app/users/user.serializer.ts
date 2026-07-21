import { asProfile, type AppAbility, type Relationship } from '@orbit/shared-auth';
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
  };
}

/**
 * Serialize a target user for a viewer, honoring the CASL Profile field-level policy:
 * full profile when the viewer may read a gated field (public account, friend, or owner),
 * otherwise the minimal card only.
 */
export function serializeProfileFor(
  target: UserEntity,
  viewerId: string | null,
  ability: AppAbility,
): UserProfile | UserCard {
  // Follow is not built yet: relationship is 'none' unless the viewer is the owner.
  const relationship: Relationship = viewerId === target.user_id ? 'friend' : 'none';
  const subject = asProfile({
    ownerId: target.user_id,
    accountType: target.account_type,
    relationship,
    username: target.tag_name,
    displayName: target.display_name,
    avatarUrl: target.profile_photo ?? undefined,
    bio: target.bio ?? undefined,
    settings: target.settings,
  });
  const full = toProfile(target);
  if (viewerId === target.user_id || ability.can('read', subject, 'bio')) {
    return full;
  }
  return toCard(full);
}
