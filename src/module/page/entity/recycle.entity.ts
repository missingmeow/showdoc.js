import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Recycle {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  item_id: number;

  @Column()
  page_id: number;

  @Column()
  page_title: string;

  @Column()
  del_by_uid: number;

  @Column()
  del_by_username: string;

  @Column()
  del_time: number;
}
