import type { AccountType, PrivateSettings } from '@orbit/shared-auth';

/** Minimal, always-public view of a user (the "card"). */
export interface UserCard {
  userId: string;
  tagName: string;
  displayName: string;
  avatarUrl: string | null;
  accountType: AccountType;
}

/** Full public profile (returned when the viewer is allowed to see it). */
export interface UserProfile extends UserCard {
  bio: string | null;
  job: string | null;
  location: string | null;
  websiteUrl: string | null;
  genre: string | null;
  age: number | null;
  createdAt: string;
}

/** The caller's own profile — adds private fields. */
export interface OwnProfile extends UserProfile {
  email: string;
  settings: PrivateSettings;
}

export interface AuthResponse {
  accessToken: string;
  user: OwnProfile;
}
