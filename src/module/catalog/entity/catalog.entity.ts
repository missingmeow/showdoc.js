import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('catalog')
export class Catalog {
  @PrimaryGeneratedColumn('increment')
  cat_id: number;

  @Column()
  cat_name: string;

  @Column()
  item_id: number;

  @Column({ default: 99 })
  s_number: number;

  @Column({ default: 0 })
  addtime: number;

  @Column({ default: 0 })
  parent_cat_id: number;

  @Column({ default: 2 })
  level: number;
}
