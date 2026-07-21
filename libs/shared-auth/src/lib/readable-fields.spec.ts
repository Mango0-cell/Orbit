import { defineAbilitiesFor, readableProfileFields } from './abilities.js';
import { asProfile } from './subjects.js';
import { defaultPrivateSettings } from './settings.js';

const publicP = asProfile({
  ownerId: 'o', accountType: 'public', relationship: 'none',
  username: 'o', displayName: 'O', avatarUrl: 'a', bio: 'hi',
});
const privateP = asProfile({
  ownerId: 'o', accountType: 'private', relationship: 'none', settings: defaultPrivateSettings(),
  username: 'o', displayName: 'O', avatarUrl: 'a', bio: 'secret',
});

describe('readableProfileFields', () => {
  it('grants gated fields (bio) on a public profile', () => {
    const fields = readableProfileFields(defineAbilitiesFor({ id: 'v', accountType: 'public' }), publicP);
    expect(fields).toContain('bio');
  });

  it('grants only card fields on a private profile to a stranger', () => {
    const fields = readableProfileFields(defineAbilitiesFor({ id: 'v', accountType: 'public' }), privateP);
    expect(fields).not.toContain('bio');
    expect(fields).toEqual(expect.arrayContaining(['username', 'displayName']));
  });

  it('grants gated fields to a friend of a private profile', () => {
    const friendP = asProfile({
      ownerId: 'o', accountType: 'private', relationship: 'friend', settings: defaultPrivateSettings(),
      username: 'o', displayName: 'O', avatarUrl: 'a', bio: 'secret',
    });
    const fields = readableProfileFields(defineAbilitiesFor({ id: 'v', accountType: 'public' }), friendP);
    expect(fields).toContain('bio');
  });

  it('grants only card fields to a guest viewing a private profile', () => {
    const fields = readableProfileFields(defineAbilitiesFor(null), privateP);
    expect(fields).not.toContain('bio');
  });
});
