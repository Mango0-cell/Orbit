import 'reflect-metadata';
import { NotificationsController } from './notifications.controller';

const authed = { id: 'u1', accountType: 'public' as const };

describe('NotificationsController', () => {
  it('list returns only the caller’s notifications, serialized', async () => {
    const svc = {
      listForUser: jest.fn(async () => [
        {
          notification_id: 1,
          user_id: 'u1',
          type: 'follow',
          title: 't',
          body: 'b',
          entity_type: null,
          entity_id: null,
          is_read: false,
          metadata: {},
          read_at: null,
          created_at: new Date('2026-01-01T00:00:00Z'),
        },
      ]),
    };
    const ctrl = new NotificationsController(svc as never);
    const res = await ctrl.list(authed);
    expect(svc.listForUser).toHaveBeenCalledWith('u1');
    expect(res[0].notificationId).toBe(1);
  });

  it('unreadCount returns the count for the caller', async () => {
    const svc = { unreadCount: jest.fn(async () => 3) };
    const ctrl = new NotificationsController(svc as never);
    expect(await ctrl.unreadCount(authed)).toEqual({ count: 3 });
  });
});
