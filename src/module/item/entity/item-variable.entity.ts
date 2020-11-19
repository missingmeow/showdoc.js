import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ItemVariable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  var_name: string;

  @Column()
  var_value: string;

  @Column()
  uid: number;

  @Column()
  item_id: number;

  @Column()
  addtime: number;
}
