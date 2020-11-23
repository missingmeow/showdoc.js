import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadFile } from './upload-file.entity';

@Injectable()
export class AttachmentService {
  constructor(@InjectRepository(UploadFile) private readonly uploadFileRepository: Repository<UploadFile>) {}

  async countPage(pageId: number) {
    return this.uploadFileRepository.count({ page_id: pageId });
  }
}
