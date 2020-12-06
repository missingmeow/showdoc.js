import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UploadFile {
  @PrimaryGeneratedColumn('increment')
  file_id: number;

  @Column({ default: '' })
  sign: string;

  @Column({ default: '' })
  display_name: string;

  @Column({ default: '' })
  file_type: string;

  @Column({ default: '' })
  file_size: string;

  @Column({ default: 0 })
  uid: number;

  @Column({ default: 0 })
  page_id: number;

  @Column({ default: 0 })
  item_id: number;

  @Column({ default: 0 })
  visit_times: number;

  @Column({ default: 0 })
  addtime: number;

  @Column({ default: '' })
  real_url: string;

  @Column({ default: 0 })
  last_update_time: number;
}
