import { subject } from '@casl/ability';
import type {
  ProfileSubject,
  PostSubject,
  DirectMessageSubject,
  AccountSettingsSubject,
} from './types.js';

/**
 * Tag plain objects with their CASL subject type so `ability.can(...)` can detect them.
 * Services build these from DB rows plus the relationship resolved over gRPC.
 */
export const asProfile = (p: ProfileSubject) => subject('Profile', p);
export const asPost = (p: PostSubject) => subject('Post', p);
export const asDirectMessage = (d: DirectMessageSubject) => subject('DirectMessage', d);
export const asAccountSettings = (a: AccountSettingsSubject) => subject('AccountSettings', a);
