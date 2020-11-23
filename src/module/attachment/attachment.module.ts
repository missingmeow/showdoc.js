import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentService } from './attachment.service';
import { UploadFile } from './upload-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UploadFile])],
  providers: [AttachmentService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
