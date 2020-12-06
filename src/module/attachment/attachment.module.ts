import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentService } from './attachment.service';
import { UploadFile } from './entity/upload-file.entity';
import { AttachmentController } from './attachment.controller';
import { CommonModule } from '../common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { diskStorage } from 'multer';
import { FileFlow } from './entity/file-flow.entity';
import { ItemModule } from '../item/item.module';
import { UserModule } from '../user/user.module';

function mkDir(path: string) {
  if (!existsSync(path)) {
    mkDir(dirname(path));
    mkdirSync(path);
  }
}

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: function (req, file, cb) {
          function n2s(num: number) {
            return num < 10 ? `0${num}` : `${num}`;
          }
          const t = new Date();
          const path = `public/uploads/${t.getFullYear()}-${n2s(t.getMonth() + 1)}-${n2s(t.getDate())}`;
          mkDir(path);
          cb(null, path);
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
    }),
    TypeOrmModule.forFeature([UploadFile, FileFlow]),
    forwardRef(() => CommonModule),
    forwardRef(() => ItemModule),
    forwardRef(() => UserModule),
  ],
  providers: [AttachmentService],
  exports: [AttachmentService],
  controllers: [AttachmentController],
})
export class AttachmentModule {}
