import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TeamItemMember {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ default: 0 })
  team_id: number;

  @Column({ default: 0 })
  item_id: number;

  @Column({ default: 0 })
  member_group_id: number;

  @Column({ default: 0 })
  member_uid: number;

  @Column({ default: '' })
  member_username: string;

  @Column({ default: 0 })
  addtime: number;

  @Column({ default: 0 })
  last_update_time: number;

  @Column({ default: 0 })
  cat_id: number;
}
