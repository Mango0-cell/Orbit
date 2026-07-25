import type { NotificationResponse } from '@orbit/shared-types';
import { NotificationEntity } from './notification.entity';

export function toNotificationResponse(
  n: NotificationEntity,
): NotificationResponse {
  return {
    notificationId: n.notification_id,
    type: n.type,
    title: n.title,
    body: n.body,
    entityType: n.entity_type,
    entityId: n.entity_id,
    isRead: n.is_read,
    metadata: n.metadata,
    readAt: n.read_at ? n.read_at.toISOString() : null,
    createdAt: n.created_at.toISOString(),
  };
}
