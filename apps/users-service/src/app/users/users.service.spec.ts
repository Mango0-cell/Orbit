import 'reflect-metadata';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { defineAbilitiesFor } from '@orbit/shared-auth';
import { serializeProfileFor } from './user.serializer';
import { UsersService } from './users.service';
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

function makeService(repoOver: Record<string, unknown> = {}) {
  const repo = {
    findOne: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => ({ ...x, user_id: 'u1' })),
    update: jest.fn(async (_criteria: unknown, _patch: unknown) => undefined),
    findOneOrFail: jest.fn(async () => entity({ user_id: 'u1' })),
    ...repoOver,
  };
  const passwords = { hash: jest.fn(async () => 'hashed'), compare: jest.fn() };
  const events = {
    created: jest.fn(async () => undefined),
    profileUpdated: jest.fn(async () => undefined),
  };
  const service = new UsersService(repo as never, passwords as never, events as never);
  return { service, repo, passwords, events };
}

describe('UsersService', () => {
  const register = {
    email: 'a@b.io', password: 'password1', tagName: 'alice', displayName: 'Alice',
    accountType: 'public' as const,
  };

  it('register rejects a duplicate email/tag with 409 and emits no event', async () => {
    const { service, events } = makeService({ findOne: jest.fn(async () => entity()) });
    await expect(service.register(register)).rejects.toBeInstanceOf(ConflictException);
    expect(events.created).not.toHaveBeenCalled();
  });

  it('register hashes the password, saves, and emits user.created', async () => {
    const { service, repo, passwords, events } = makeService({ findOne: jest.fn(async () => null) });
    const saved = await service.register(register);
    expect(passwords.hash).toHaveBeenCalledWith('password1');
    expect(repo.save).toHaveBeenCalled();
    expect(saved.password).toBe('hashed');
    expect(events.created).toHaveBeenCalledWith(saved);
  });

  it('validateCredentials rejects an unknown user with 401', async () => {
    const { service } = makeService({ findOne: jest.fn(async () => null) });
    await expect(service.validateCredentials('a@b.io', 'x')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('validateCredentials rejects a wrong password with 401', async () => {
    const { service, passwords } = makeService({ findOne: jest.fn(async () => entity()) });
    passwords.compare.mockResolvedValue(false);
    await expect(service.validateCredentials('o@x.io', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('updateOwn prunes undefined fields and emits camelCase changedFields', async () => {
    const { service, repo, events } = makeService();
    await service.updateOwn('u1', { displayName: 'New', websiteUrl: 'https://x.io' });
    const patch = repo.update.mock.calls[0][1];
    expect(patch).toEqual({ display_name: 'New', website_url: 'https://x.io' });
    expect(events.profileUpdated).toHaveBeenCalledWith('u1', ['displayName', 'websiteUrl']);
  });
});
