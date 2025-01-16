import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Url {
  @PrimaryColumn({ length: 16 })
  shortUrl: string;

  @Column()
  originalUrl: string;
}
