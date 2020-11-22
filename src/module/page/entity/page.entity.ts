import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Page {
  @PrimaryGeneratedColumn('increment')
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

  @Column()
  s_number: number;

  @Column()
  addtime: number;

  @Column()
  is_del: number;
}
