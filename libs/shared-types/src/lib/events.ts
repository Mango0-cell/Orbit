import type { AccountType } from '@orbit/shared-auth';

export const USER_EVENTS = {
  created: 'user.created',
  profileUpdated: 'user.profile.updated',
} as const;

export interface UserCreatedEvent {
  userId: string;
  tagName: string;
  accountType: AccountType;
  at: string;
}

export interface UserProfileUpdatedEvent {
  userId: string;
  changedFields: string[];
  at: string;
}
