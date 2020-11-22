import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SinglePage {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  unique_key: string;

  @Column()
  page_id: number;
}
