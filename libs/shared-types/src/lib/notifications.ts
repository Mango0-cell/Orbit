/** Notifications-domain contract types. Framework-agnostic; shared across services. */

export type NotificationType =
  'follow' | 'post' | 'comment' | 'reaction' | 'message' | 'system';

export interface NotificationResponse {
  notificationId: number;
  type: NotificationType;
  title: string;
  body: string;
  /** What the notification points at, e.g. 'post' / 'user' (logical). */
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}
