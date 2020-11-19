import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ItemTop {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  item_id: number;

  @Column()
  uid: number;

  @Column()
  addtime: number;
}
