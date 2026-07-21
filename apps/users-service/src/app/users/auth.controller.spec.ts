import 'reflect-metadata';
import { AuthController } from './auth.controller';
import { UserEntity } from './user.entity';

describe('AuthController', () => {
  const entity = Object.assign(new UserEntity(), {
    user_id: 'u1', email: 'a@b.io', tag_name: 't', display_name: 'A',
    account_type: 'public', settings: {}, profile_photo: null, bio: null, job: null,
    location: null, website_url: null, genre: null, age: null, created_at: new Date(),
  });
  const users = {
    register: jest.fn().mockResolvedValue(entity),
    validateCredentials: jest.fn().mockResolvedValue(entity),
  };
  const ctrl = new AuthController(users as never, 'secret');

  it('register returns a token + own profile', async () => {
    const res = await ctrl.register({
      email: 'a@b.io', password: 'password1', tagName: 't', displayName: 'A', accountType: 'public',
    });
    expect(res.accessToken).toEqual(expect.any(String));
    expect(res.user.email).toBe('a@b.io');
  });

  it('login delegates to validateCredentials', async () => {
    await ctrl.login({ email: 'a@b.io', password: 'password1' });
    expect(users.validateCredentials).toHaveBeenCalledWith('a@b.io', 'password1');
  });
});
