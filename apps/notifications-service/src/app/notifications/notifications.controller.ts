import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Authenticated, CurrentUser } from '@orbit/nest-common';
import type { AuthUser } from '@orbit/shared-auth';
import type { NotificationResponse } from '@orbit/shared-types';
import { NotificationsService } from './notifications.service';
import { toNotificationResponse } from './notification.serializer';

/** Every route is scoped to the authenticated caller — you only ever see your own. */
@Authenticated()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser): Promise<NotificationResponse[]> {
    const rows = await this.notifications.listForUser(user.id);
    return rows.map(toNotificationResponse);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: AuthUser): Promise<{ count: number }> {
    return { count: await this.notifications.unreadCount(user.id) };
  }

  @Patch(':id/read')
  async markRead(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificationResponse> {
    return toNotificationResponse(
      await this.notifications.markRead(user.id, id),
    );
  }

  @Post('read-all')
  @HttpCode(204)
  async markAllRead(@CurrentUser() user: AuthUser): Promise<void> {
    await this.notifications.markAllRead(user.id);
  }
}
