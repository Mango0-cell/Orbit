import 'reflect-metadata';
import { defineAbilitiesFor } from '@orbit/shared-auth';
import { serializeProfileFor } from './user.serializer';
import { UserEntity } from './user.entity';

function entity(over: Partial<UserEntity> = {}): UserEntity {
  return Object.assign(new UserEntity(), {
    user_id: 'o1', email: 'o@x.io', password: 'h', tag_name: 'owner', display_name: 'Owner',
    bio: 'secret', job: null, location: null, website_url: null, profile_photo: null,
    genre: null, age: null, account_type: 'public', settings: {}, created_at: new Date(),
    updated_at: new Date(),
  }, over);
}

describe('serializeProfileFor', () => {
  it('returns the full profile for a public account', () => {
    const out = serializeProfileFor(
      entity({ account_type: 'public' }),
      'v1',
      defineAbilitiesFor({ id: 'v1', accountType: 'public' }),
    );
    expect((out as { bio?: string }).bio).toBe('secret');
  });

  it('returns only the card for a private account viewed by a stranger', () => {
    const out = serializeProfileFor(
      entity({ account_type: 'private' }),
      'v1',
      defineAbilitiesFor({ id: 'v1', accountType: 'public' }),
    );
    expect((out as { bio?: string }).bio).toBeUndefined();
    expect(out.tagName).toBe('owner');
    expect(out.accountType).toBe('private');
  });

  it('returns the full profile to the owner even if private', () => {
    const out = serializeProfileFor(
      entity({ account_type: 'private' }),
      'o1',
      defineAbilitiesFor({ id: 'o1', accountType: 'private' }),
    );
    expect((out as { bio?: string }).bio).toBe('secret');
  });

  it('returns only the card to a guest viewing a private account', () => {
    const out = serializeProfileFor(entity({ account_type: 'private' }), null, defineAbilitiesFor(null));
    expect((out as { bio?: string }).bio).toBeUndefined();
    expect(out.tagName).toBe('owner');
  });
});
