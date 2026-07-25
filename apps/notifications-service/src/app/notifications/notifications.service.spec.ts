import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationEntity } from './notification.entity';

function notif(over: Partial<NotificationEntity> = {}): NotificationEntity {
  return Object.assign(
    new NotificationEntity(),
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
      created_at: new Date(),
    },
    over,
  );
}

function make(repoOver: Record<string, unknown> = {}) {
  const repo = {
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => ({ ...x, notification_id: 1 })),
    findOne: jest.fn(),
    find: jest.fn(async () => []),
    count: jest.fn(async () => 0),
    update: jest.fn(async () => undefined),
    ...repoOver,
  };
  const service = new NotificationsService(repo as never);
  return { service, repo };
}

describe('NotificationsService', () => {
  it('create maps the input to entity columns', async () => {
    const { service, repo } = make();
    await service.create({
      userId: 'u1',
      type: 'post',
      title: 't',
      body: 'b',
      entityId: 'p1',
      entityType: 'post',
    });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'u1',
        type: 'post',
        entity_id: 'p1',
        entity_type: 'post',
      }),
    );
  });

  it("markRead 404s another user's notification", async () => {
    const { service } = make({
      findOne: jest.fn(async () => notif({ user_id: 'someone' })),
    });
    await expect(service.markRead('u1', 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('markRead sets is_read + read_at for the owner', async () => {
    const { service, repo } = make({ findOne: jest.fn(async () => notif()) });
    const out = await service.markRead('u1', 1);
    expect(out.is_read).toBe(true);
    expect(out.read_at).toBeInstanceOf(Date);
    expect(repo.save).toHaveBeenCalled();
  });

  it("markAllRead updates only the caller's unread rows", async () => {
    const { service, repo } = make();
    await service.markAllRead('u1');
    expect(repo.update).toHaveBeenCalledWith(
      { user_id: 'u1', is_read: false },
      expect.objectContaining({ is_read: true }),
    );
  });
});
