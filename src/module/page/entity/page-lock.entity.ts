import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PageLock {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  page_id: number;

  @Column()
  lock_uid: number;

  @Column()
  lock_username: string;

  @Column()
  lock_to: number;

  @Column()
  addtime: number;
}
