import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ALIAS_MAX_LENGTH } from './constants';
import { User } from '../users/user.entity';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: ALIAS_MAX_LENGTH })
  alias: string;

  @Column({ name: 'original_url' })
  originalUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.urls)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
