import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { defaultPrivateSettings } from '@orbit/shared-auth';
import type { AccountType, PrivateSettings } from '@orbit/shared-auth';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') user_id!: string;
  @Index({ unique: true }) @Column() email!: string;
  @Column() password!: string;
  @Index({ unique: true }) @Column() tag_name!: string;
  @Column() display_name!: string;
  @Column({ type: 'varchar', nullable: true }) bio!: string | null;
  @Column({ type: 'varchar', nullable: true }) job!: string | null;
  @Column({ type: 'varchar', nullable: true }) location!: string | null;
  @Column({ type: 'varchar', nullable: true }) website_url!: string | null;
  @Column({ type: 'varchar', nullable: true }) profile_photo!: string | null;
  @Column({ type: 'varchar', nullable: true }) genre!: string | null;
  @Column({ type: 'int', nullable: true }) age!: number | null;
  @Column({ type: 'varchar', default: 'public' }) account_type!: AccountType;
  @Column({ type: 'jsonb', default: () => "'{}'" }) settings!: PrivateSettings;
  @CreateDateColumn({ type: 'timestamptz' }) created_at!: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updated_at!: Date;

  /** Strict privacy defaults applied to every new account (public accounts ignore them). */
  static newSettings(): PrivateSettings {
    return defaultPrivateSettings();
  }
}
