import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('direct_messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid') message_id!: string;
  /** In-database FK to direct_conversations (same database — allowed). */
  @Index() @Column({ type: 'uuid' }) conversation_id!: string;
  @Column({ type: 'uuid' }) sender_user_id!: string;
  @Column({ type: 'uuid' }) receiver_user_id!: string;
  @Column({ type: 'text' }) message_body!: string;
  @CreateDateColumn({ type: 'timestamptz' }) created_at!: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updated_at!: Date;
}
