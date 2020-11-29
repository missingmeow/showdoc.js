import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  team_id: number;

  @Column({ default: 0 })
  member_uid: number;

  @Column({ default: '' })
  member_username: string;

  @Column({ default: 0 })
  addtime: number;

  @Column({ default: 0 })
  last_update_time: number;
}
