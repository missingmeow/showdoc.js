import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TeamItemMember {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  team_id: number;

  @Column()
  item_id: number;

  @Column()
  member_group_id: number;

  @Column()
  member_uid: number;

  @Column()
  member_username: string;

  @Column()
  addtime: number;

  @Column()
  last_update_time: number;

  @Column()
  cat_id: number;
}
