import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ default: '' })
  team_name: string;

  @Column({ default: 0 })
  uid: number;

  @Column({ default: '' })
  username: string;

  @Column({ default: 0 })
  addtime: number;

  @Column({ default: 0 })
  last_update_time: number;
}
