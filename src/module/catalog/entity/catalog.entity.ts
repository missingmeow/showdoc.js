import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('catalog')
export class Catalog {
  @PrimaryGeneratedColumn('increment')
  cat_id: number;

  @Column()
  cat_name: string;

  @Column()
  item_id: number;

  @Column()
  s_number: number;

  @Column()
  addtime: number;

  @Column()
  parent_cat_id: number;

  @Column()
  level: number;
}
