import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ItemMember {
  @PrimaryGeneratedColumn('increment')
  item_member_id: number;

  @Column()
  item_id: number;

  @Column()
  uid: number;

  @Column()
  username: string;

  @Column()
  addtime: number;

  @Column()
  member_group_id: number;

  @Column()
  cat_id: number;
}
