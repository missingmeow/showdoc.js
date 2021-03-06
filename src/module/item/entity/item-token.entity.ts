import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ItemToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  item_id: number;

  @Column({ length: 200, nullable: false, unique: true })
  api_key: string;

  @Column({ length: 200 })
  api_token: string;

  @Column({ default: 0 })
  addtime: number;

  @Column({ default: 0 })
  last_check_time: number;
}
