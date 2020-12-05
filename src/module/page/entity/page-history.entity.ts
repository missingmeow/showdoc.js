import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PageHistory {
  @PrimaryGeneratedColumn('increment')
  page_history_id: number;

  @Column()
  page_id: number;

  @Column()
  author_uid: number;

  @Column()
  author_username: string;

  @Column()
  item_id: number;

  @Column()
  cat_id: number;

  @Column()
  page_title: string;

  @Column()
  page_content: string;

  @Column()
  page_comments: string;

  @Column({ default: 99 })
  s_number: number;

  @Column({ default: 0 })
  addtime: number;
}
