import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, rmSync } from 'fs';
import { DeepPartial, FindConditions, FindManyOptions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FileFlow } from './entity/file-flow.entity';
import { UploadFile } from './entity/upload-file.entity';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(UploadFile) private readonly uploadFileRepository: Repository<UploadFile>,
    @InjectRepository(FileFlow) private readonly fileFlowRepository: Repository<FileFlow>,
  ) {}

  async countUploadFile(pageId: number) {
    return this.uploadFileRepository.count({ page_id: pageId });
  }

  async findOneUploadFile(conditions: FindConditions<UploadFile>) {
    return this.uploadFileRepository.findOne(conditions);
  }

  async findUploadFile(options: FindManyOptions<UploadFile>) {
    return this.uploadFileRepository.find(options);
  }

  async searchUploadFile(
    page: number,
    count: number,
    options: {
      display_name?: string;
      attachment_type?: number;
      uid?: number;
    },
  ) {
    const builder = this.uploadFileRepository.createQueryBuilder();
    builder.offset((page - 1) * count);
    builder.limit(count);
    builder.where('1=1');
    if (options.uid) {
      builder.where('uid=:uid', { uid: options.uid });
    }
    if (options.attachment_type == 1) {
      builder.andWhere('file_type like :type', { type: '%image%' });
    } else if (options.attachment_type == 2) {
      builder.andWhere('file_type not like :type', { type: '%image%' });
    }
    if (options.display_name) {
      builder.andWhere('display_name like :name', { name: `%${options.display_name}%` });
    }
    builder.orderBy('addtime', 'DESC');
    return builder.getManyAndCount();
  }

  async searchUploadFileSize(uid: number) {
    return this.uploadFileRepository
      .createQueryBuilder()
      .select('sum(file_size) as count')
      .where('uid=:uid', { uid })
      .execute();
  }

  async saveUploadFile(entities: DeepPartial<UploadFile>) {
    return this.uploadFileRepository.save(entities);
  }

  async updateUploadFile(criteria: FindConditions<UploadFile>, partialEntity: QueryDeepPartialEntity<UploadFile>) {
    return this.uploadFileRepository.update(criteria, partialEntity);
  }

  /**
   * 获取某个用户的当前已使用附件流量
   * @param uid 用户 id
   */
  async getUserFlow(uid: number): Promise<number> {
    const t = new Date();
    const month = `${t.getFullYear()}-${t.getMonth() + 1 < 10 ? '0' : ''}${t.getMonth() + 1}`;
    const flow = await this.fileFlowRepository.findOne({ uid, date_month: month });
    if (flow) {
      return flow.used;
    }
    await this.fileFlowRepository.save({ uid, date_month: month });
    return 0;
  }

  /**
   * 记录某个用户流量
   * @param uid 用户 id
   * @param fileSize 文件大小
   */
  async recordUserFlow(uid: number, fileSize: number) {
    const t = new Date();
    const month = `${t.getFullYear()}-${t.getMonth() + 1 < 10 ? '0' : ''}${t.getMonth() + 1}`;
    const cur = await this.getUserFlow(uid);
    await this.fileFlowRepository.update({ uid, date_month: month }, { used: cur + fileSize });
  }

  /**
   * 彻底删除文件
   * @param fileId 文件 id
   */
  async deleteFile(fileId: number) {
    const file = await this.uploadFileRepository.findOne({ file_id: fileId });
    if (!file) {
      return;
    }
    const realUrl = file.real_url.toLocaleLowerCase();
    const path = file.real_url.substr(realUrl.indexOf('/public/uploads/'));
    if (existsSync(path)) {
      rmSync(path);
    }
    await this.uploadFileRepository.delete({ file_id: fileId });
  }
}
