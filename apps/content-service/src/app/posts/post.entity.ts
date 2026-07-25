import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { PostVisibility } from '@orbit/shared-types';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn('uuid') post_id!: string;
  /** Logical reference to a user in db_users — NOT a cross-database FK. */
  @Index() @Column({ type: 'uuid' }) user_id!: string;
  @Column({ type: 'text' }) content!: string;
  @Column({ type: 'varchar', default: 'public' }) visibility!: PostVisibility;
  @CreateDateColumn({ type: 'timestamptz' }) created_at!: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updated_at!: Date;
}
