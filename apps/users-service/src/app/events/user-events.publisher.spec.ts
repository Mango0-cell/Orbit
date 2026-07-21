import 'reflect-metadata';
import { USER_EVENTS } from '@orbit/shared-types';
import { UserEventsPublisher } from './user-events.publisher';

describe('UserEventsPublisher', () => {
  const bus = { publish: jest.fn().mockResolvedValue(undefined) };
  const pub = new UserEventsPublisher(bus as never);

  it('publishes user.created with the right payload', async () => {
    await pub.created({ user_id: 'u1', tag_name: 't', account_type: 'public' } as never);
    expect(bus.publish).toHaveBeenCalledWith(
      USER_EVENTS.created,
      expect.objectContaining({ userId: 'u1', tagName: 't', accountType: 'public' }),
    );
  });

  it('publishes user.profile.updated with the changed fields', async () => {
    await pub.profileUpdated('u1', ['bio', 'display_name']);
    expect(bus.publish).toHaveBeenCalledWith(
      USER_EVENTS.profileUpdated,
      expect.objectContaining({ userId: 'u1', changedFields: ['bio', 'display_name'] }),
    );
  });
});
