import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { NotificationType } from '@orbit/shared-types';
import { NotificationEntity } from './notification.entity';

/** Input for creating a notification — used by the event consumer in the mesh phase. */
export interface NewNotification {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  create(input: NewNotification): Promise<NotificationEntity> {
    const notification = this.repo.create({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
    });
    return this.repo.save(notification);
  }

  listForUser(userId: string): Promise<NotificationEntity[]> {
    return this.repo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  unreadCount(userId: string): Promise<number> {
    return this.repo.count({ where: { user_id: userId, is_read: false } });
  }

  async markRead(userId: string, id: number): Promise<NotificationEntity> {
    const notification = await this.repo.findOne({
      where: { notification_id: id },
    });
    // Hide others' notifications behind a 404 — never reveal their existence.
    if (!notification || notification.user_id !== userId) {
      throw new NotFoundException();
    }
    notification.is_read = true;
    notification.read_at = new Date();
    return this.repo.save(notification);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo.update(
      { user_id: userId, is_read: false },
      { is_read: true, read_at: new Date() },
    );
  }
}
