import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TeamItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  team_id: number;

  @Column()
  item_id: number;

  @Column()
  addtime: number;

  @Column()
  last_update_time: number;
}
