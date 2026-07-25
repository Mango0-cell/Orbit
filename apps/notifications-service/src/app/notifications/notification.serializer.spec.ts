import 'reflect-metadata';
import { toNotificationResponse } from './notification.serializer';
import { NotificationEntity } from './notification.entity';

function notif(over: Partial<NotificationEntity> = {}): NotificationEntity {
  return Object.assign(
    new NotificationEntity(),
    {
      notification_id: 1,
      user_id: 'u1',
      type: 'follow',
      title: 'New follower',
      body: 'x follows you',
      entity_type: 'user',
      entity_id: 'x',
      is_read: false,
      metadata: {},
      read_at: null,
      created_at: new Date('2026-01-01T00:00:00Z'),
    },
    over,
  );
}

describe('notification.serializer', () => {
  it('maps the entity to the contract shape (null read_at stays null)', () => {
    expect(toNotificationResponse(notif())).toEqual({
      notificationId: 1,
      type: 'follow',
      title: 'New follower',
      body: 'x follows you',
      entityType: 'user',
      entityId: 'x',
      isRead: false,
      metadata: {},
      readAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('serializes read_at when the notification has been read', () => {
    const r = toNotificationResponse(
      notif({ is_read: true, read_at: new Date('2026-01-02T00:00:00Z') }),
    );
    expect(r.isRead).toBe(true);
    expect(r.readAt).toBe('2026-01-02T00:00:00.000Z');
  });
});
