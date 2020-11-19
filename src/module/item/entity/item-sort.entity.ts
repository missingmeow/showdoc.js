import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ItemSort {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  uid: number;

  @Column()
  item_sort_data: string;

  @Column()
  addtime: number;
}
