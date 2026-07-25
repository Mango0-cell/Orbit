import 'reflect-metadata';
import { defaultPrivateSettings } from '@orbit/shared-auth';
import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  it('newSettings returns the strict private defaults', () => {
    expect(UserEntity.newSettings()).toEqual(defaultPrivateSettings());
  });
});
