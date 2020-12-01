import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Template {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  uid: number;

  @Column()
  username: string;

  @Column()
  template_title: string;

  @Column()
  template_content: string;

  @Column()
  addtime: number;
}
