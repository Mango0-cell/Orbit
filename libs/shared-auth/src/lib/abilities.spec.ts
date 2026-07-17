import { defineAbilitiesFor, isGuest } from './abilities.js';
import { asProfile, asPost, asDirectMessage, asAccountSettings } from './subjects.js';
import { defaultPrivateSettings } from './settings.js';
import type { AuthUser, PrivateSettings, Relationship } from './types.js';

const PRIV = defaultPrivateSettings();

const publicProfile = (relationship: Relationship = 'none') =>
  asProfile({ ownerId: 'pub', accountType: 'public', relationship, username: 'pub', displayName: 'Public', avatarUrl: 'a', bio: 'hi' });

const privateProfile = (relationship: Relationship = 'none', settings: PrivateSettings = PRIV) =>
  asProfile({ ownerId: 'prv', accountType: 'private', relationship, settings, username: 'prv', displayName: 'Private', avatarUrl: 'a', bio: 'secret' });

const publicPost = (relationship: Relationship = 'none', ownerId = 'pub') =>
  asPost({ postId: 'p1', ownerId, ownerAccountType: 'public', relationship });

const privatePost = (relationship: Relationship = 'none', ownerSettings: PrivateSettings = PRIV, ownerId = 'prv') =>
  asPost({ postId: 'p2', ownerId, ownerAccountType: 'private', relationship, ownerSettings });

const dm = (recipientAccountType: 'public' | 'private', relationship: Relationship, recipientSettings: PrivateSettings = PRIV) =>
  asDirectMessage({ recipientId: 'r', recipientAccountType, relationship, recipientSettings });

const guest = null;
const authed: AuthUser = { id: 'me', accountType: 'public' };

describe('Orbit authorization policies (CASL)', () => {
  describe('guest (unauthenticated)', () => {
    const a = defineAbilitiesFor(guest);
    it('detects a guest', () => expect(isGuest(guest)).toBe(true));
    it('reads public posts and full public profiles', () => {
      expect(a.can('read', publicPost())).toBe(true);
      expect(a.can('read', publicProfile(), 'bio')).toBe(true);
    });
    it('sees only the minimal card of a private profile', () => {
      expect(a.can('read', privateProfile(), 'username')).toBe(true);
      expect(a.can('read', privateProfile(), 'bio')).toBe(false);
    });
    it('cannot read private posts', () => expect(a.can('read', privatePost())).toBe(false));
    it('cannot interact at all', () => {
      expect(a.can('react', publicPost())).toBe(false);
      expect(a.can('comment', publicPost())).toBe(false);
      expect(a.can('share', publicPost())).toBe(false);
      expect(a.can('message', dm('public', 'follower'))).toBe(false);
      expect(a.can('follow', publicProfile())).toBe(false);
    });
  });

  describe('authenticated — public targets', () => {
    const a = defineAbilitiesFor(authed);
    it('reads and interacts with public posts as a stranger', () => {
      expect(a.can('read', publicPost('none'))).toBe(true);
      expect(a.can('react', publicPost('none'))).toBe(true);
      expect(a.can('comment', publicPost('none'))).toBe(true);
      expect(a.can('share', publicPost('none'))).toBe(true);
    });
    it('cannot DM a public account without following it', () =>
      expect(a.can('message', dm('public', 'none'))).toBe(false));
    it('can DM a public account it follows (or is friends with)', () => {
      expect(a.can('message', dm('public', 'follower'))).toBe(true);
      expect(a.can('message', dm('public', 'friend'))).toBe(true);
    });
    it('can follow anyone (open follow)', () => {
      expect(a.can('follow', publicProfile())).toBe(true);
      expect(a.can('follow', privateProfile())).toBe(true);
    });
  });

  describe('authenticated — private targets', () => {
    const a = defineAbilitiesFor(authed);

    it('stranger sees only the card, no posts, no interaction', () => {
      expect(a.can('read', privateProfile('none'), 'username')).toBe(true);
      expect(a.can('read', privateProfile('none'), 'bio')).toBe(false);
      expect(a.can('read', privatePost('none'))).toBe(false);
      expect(a.can('react', privatePost('none'))).toBe(false);
      expect(a.can('comment', privatePost('none'))).toBe(false);
      expect(a.can('message', dm('private', 'none'))).toBe(false);
      expect(a.can('request-message', dm('private', 'none'))).toBe(false);
    });

    it('follower still cannot see profile/posts', () => {
      expect(a.can('read', privateProfile('follower'), 'bio')).toBe(false);
      expect(a.can('read', privatePost('follower'))).toBe(false);
    });

    it('follower can send a message REQUEST but not a direct message', () => {
      expect(a.can('request-message', dm('private', 'follower'))).toBe(true);
      expect(a.can('message', dm('private', 'follower'))).toBe(false);
    });

    it('follower request is blocked when the owner disabled requests', () => {
      const s = { ...PRIV, allowFollowerMessageRequests: false };
      expect(a.can('request-message', dm('private', 'follower', s))).toBe(false);
    });

    it('friend reads the full profile and posts (default settings)', () => {
      expect(a.can('read', privateProfile('friend'), 'bio')).toBe(true);
      expect(a.can('read', privatePost('friend'))).toBe(true);
    });

    it('friend reacts, comments, shares, and messages directly', () => {
      expect(a.can('react', privatePost('friend'))).toBe(true);
      expect(a.can('share', privatePost('friend'))).toBe(true);
      expect(a.can('comment', privatePost('friend'))).toBe(true);
      expect(a.can('message', dm('private', 'friend'))).toBe(true);
    });

    it('friend access respects owner toggles', () => {
      expect(a.can('read', privatePost('friend', { ...PRIV, postsVisibleToFriends: false }))).toBe(false);
      expect(a.can('comment', privatePost('friend', { ...PRIV, allowFriendComments: false }))).toBe(false);
      expect(a.can('react', privatePost('friend', { ...PRIV, allowFriendReactions: false }))).toBe(false);
      expect(a.can('share', privatePost('friend', { ...PRIV, allowFriendReactions: false }))).toBe(false);
    });
  });

  describe('own resources', () => {
    const me: AuthUser = { id: 'u1', accountType: 'private' };
    const a = defineAbilitiesFor(me);
    it('full rights over own post regardless of account type', () => {
      const own = asPost({ postId: 'x', ownerId: 'u1', ownerAccountType: 'private', relationship: 'none' });
      expect(a.can('read', own)).toBe(true);
      expect(a.can('react', own)).toBe(true);
      expect(a.can('comment', own)).toBe(true);
      expect(a.can('share', own)).toBe(true);
    });
    it('manages only its own account settings', () => {
      expect(a.can('manage', asAccountSettings({ ownerId: 'u1' }))).toBe(true);
      expect(a.can('manage', asAccountSettings({ ownerId: 'other' }))).toBe(false);
    });
  });
});
