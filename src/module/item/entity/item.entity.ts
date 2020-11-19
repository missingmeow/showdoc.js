import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('increment')
  item_id: number;

  @Column()
  item_name: string;

  @Column()
  item_description: string;

  @Column()
  uid: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  addtime: number;

  @Column()
  last_update_time: number;

  @Column()
  item_domain: string;

  @Column()
  item_type: number;

  @Column()
  is_archived: number;

  @Column()
  is_del: number;
}
