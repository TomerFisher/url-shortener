import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { ALIAS_MAX_LENGTH } from './constants';

@Entity('urls')
export class Url {
  @PrimaryColumn({ length: ALIAS_MAX_LENGTH })
  alias: string;

  @Column({ name: 'original_url' })
  originalUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
