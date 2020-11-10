import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Options {
  @PrimaryGeneratedColumn('increment')
  option_id: number;

  @Column()
  option_name: string;

  @Column()
  option_value: string;
}
