import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('direct_conversations')
@Index('UQ_direct_conversations_pair', ['user_1_id', 'user_2_id'], {
  unique: true,
})
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid') conversation_id!: string;
  /** Ordered pair (user_1_id < user_2_id) — logical refs to db_users, no cross-DB FK. */
  @Column({ type: 'uuid' }) user_1_id!: string;
  @Column({ type: 'uuid' }) user_2_id!: string;
  @CreateDateColumn({ type: 'timestamptz' }) created_at!: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updated_at!: Date;
}
