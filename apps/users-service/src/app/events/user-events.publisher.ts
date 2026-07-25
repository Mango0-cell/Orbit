import { Inject, Injectable } from '@nestjs/common';
import {
  USER_EVENTS,
  type UserCreatedEvent,
  type UserProfileUpdatedEvent,
} from '@orbit/shared-types';
import { type DomainEventPublisher } from '@orbit/message-broker';
import type { UserEntity } from '../users/user.entity';

/** DI token for the domain-event bus (no-op until the broker phase wires amqp). */
export const EVENT_BUS = Symbol('ORBIT_EVENT_BUS');

@Injectable()
export class UserEventsPublisher {
  constructor(@Inject(EVENT_BUS) private readonly bus: DomainEventPublisher) {}

  created(u: UserEntity): Promise<void> {
    const event: UserCreatedEvent = {
      userId: u.user_id,
      tagName: u.tag_name,
      accountType: u.account_type,
      at: new Date().toISOString(),
    };
    return this.bus.publish(USER_EVENTS.created, event);
  }

  profileUpdated(userId: string, changedFields: string[]): Promise<void> {
    const event: UserProfileUpdatedEvent = {
      userId,
      changedFields,
      at: new Date().toISOString(),
    };
    return this.bus.publish(USER_EVENTS.profileUpdated, event);
  }
}
