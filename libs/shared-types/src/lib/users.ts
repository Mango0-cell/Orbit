import type { AccountType, PrivateSettings } from '@orbit/shared-auth';

/** Minimal, always-public view of a user (the "card"). */
export interface UserCard {
  userId: string;
  tagName: string;
  displayName: string;
  avatarUrl: string | null;
  accountType: AccountType;
  /** Public-level: shown on every profile, including private accounts, to any viewer. */
  bio: string | null;
}

/** Full profile (returned when the viewer is allowed to see the gated fields). */
export interface UserProfile extends UserCard {
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
