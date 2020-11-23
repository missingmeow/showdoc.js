import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UploadFile {
  @PrimaryGeneratedColumn('increment')
  file_id: number;

  @Column()
  sign: string;

  @Column()
  display_name: string;

  @Column()
  file_type: string;

  @Column()
  file_size: string;

  @Column()
  uid: number;

  @Column()
  page_id: number;

  @Column()
  item_id: number;

  @Column()
  visit_times: number;

  @Column()
  addtime: number;

  @Column()
  real_url: string;

  @Column()
  last_update_time: number;
}
