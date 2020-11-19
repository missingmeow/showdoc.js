import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  team_name: string;

  @Column()
  uid: number;

  @Column()
  username: string;

  @Column()
  addtime: number;

  @Column()
  last_update_time: number;
}
