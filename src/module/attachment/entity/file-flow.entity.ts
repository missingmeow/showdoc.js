import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FileFlow {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ default: 0 })
  uid: number;

  @Column({ default: 0 })
  used: number;

  @Column({ default: '' })
  date_month: string;
}
