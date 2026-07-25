import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { NotificationType } from '@orbit/shared-types';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn() notification_id!: number;
  /** Recipient — logical reference to a user in db_users (no cross-database FK). */
  @Index() @Column({ type: 'uuid' }) user_id!: string;
  @Column({ type: 'varchar' }) type!: NotificationType;
  @Column({ type: 'varchar' }) title!: string;
  @Column({ type: 'text' }) body!: string;
  @Column({ type: 'varchar', nullable: true }) entity_type!: string | null;
  @Column({ type: 'varchar', nullable: true }) entity_id!: string | null;
  @Column({ type: 'boolean', default: false }) is_read!: boolean;
  @Column({ type: 'jsonb', default: () => "'{}'" }) metadata!: Record<
    string,
    unknown
  >;
  @Column({ type: 'timestamptz', nullable: true }) read_at!: Date | null;
  @CreateDateColumn({ type: 'timestamptz' }) created_at!: Date;
}
