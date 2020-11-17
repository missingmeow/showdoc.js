import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserToken {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  uid: number;

  @Column()
  token: string;

  @Column()
  token_expire: number;

  @Column()
  ip: string;

  @Column()
  addtime: number;
}
