import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  uid: number;

  @Column()
  username: string;

  @Column({ default: 2 })
  groupid: number;

  @Column()
  name: string;

  @Column()
  avatar: string;

  @Column()
  avatar_small: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column('blob')
  cookie_token: string;

  @Column()
  cookie_token_expire: string;

  @Column()
  reg_time: number;

  @Column()
  last_login_time: number;
}
