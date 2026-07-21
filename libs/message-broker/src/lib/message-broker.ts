export function messageBroker(): string {
  return 'message-broker';
}

/** Topic exchange every Orbit domain event is published to. */
export const ORBIT_EXCHANGE = 'orbit.events';

/**
 * Transport-agnostic publisher contract. Services depend on this interface;
 * the concrete amqp-backed implementation is wired in the broker phase.
 */
export interface DomainEventPublisher {
  publish(routingKey: string, payload: unknown): Promise<void>;
}
