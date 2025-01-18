import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ALIAS_MAX_LENGTH } from './constants';

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
}
