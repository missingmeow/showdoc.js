import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TeamItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  team_id: number;

  @Column()
  item_id: number;

  @Column({ default: 0 })
  addtime: number;

  @Column({ default: 0 })
  last_update_time: number;
}
