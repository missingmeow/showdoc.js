import { Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Request, Response } from 'express';
import { createHash } from 'crypto';
import { CommonService } from '../common/common.service';
import { AttachmentService } from './attachment.service';
import { now, timeString } from 'src/utils/utils.util';
import { JwtAdminGuard, JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { UploadListDto, UploadMyListDto } from './dto/attachment.dto';
import { sendError, sendResult } from 'src/utils/send.util';
import { ItemService } from '../item/item.service';
import { rmSync } from 'fs';
import { UserService } from '../user/user.service';

@Controller('api/attachment')
export class AttachmentController {
  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly commonService: CommonService,
    private readonly itemService: ItemService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: '浏览附件' })
  @Get('visitFile/sign/:id')
  async visitFile(@Param('id') sign: string, @Res({ passthrough: true }) res: Response) {
    if (sign.indexOf('&') != -1) {
      sign = sign.substr(0, sign.indexOf('&'));
    }
    const file = await this.attachmentService.findOneUploadFile({ sign });
    if (!file) {
      return 'Missing Meow - keep looking!';
    }
    // TODO: 如果是apk文件且在微信浏览器中打开
    await this.attachmentService.updateUploadFile(
      { sign },
      { visit_times: file.visit_times + 1, last_update_time: now() },
    );
    // 记录用户流量
    await this.attachmentService.recordUserFlow(file.uid, parseInt(file.file_size));
    res.redirect(file.real_url);
  }

  @ApiOperation({ summary: '上传图片' })
  @Post('uploadImg')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('editormd-image-file'))
  async uploadImg(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Body() info: UploadListDto) {
    const option = await this.commonService.findOneOption('oss_open');
    if (option && option.option_value == '1') {
      // TODO: 文件上传到 OSS
    }
    // 如果是在本地存放的文件，就不需要加域名了，后面域名改了不好弄了
    // const url = req.header('origin') + '/' + file.path;
    const url = '/' + file.path;
    const sign = createHash('md5').update(file.path).digest('hex');
    await this.attachmentService.saveUploadFile({
      sign: sign,
      uid: req.user['uid'],
      item_id: info.item_id ? parseInt(info.item_id) : 0,
      page_id: info.page_id ? parseInt(info.page_id) : 0,
      display_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size.toString(),
      real_url: url,
      addtime: now(),
    });
    return {
      success: 1,
      url: `/api/attachment/visitFile/sign/${sign}?meow=.jpg`,
    };
  }

  @ApiOperation({ summary: '页面的上传附件列表' })
  @UseGuards(JwtAuthGuard)
  @Post('pageAttachmentUploadList')
  async pageAttachmentUploadList(@Req() req: Request, @Body() listDto: UploadListDto) {
    const pageId = parseInt(listDto.page_id);
    if (!pageId) {
      return sendError(10103, '请至少先保存一次页面内容');
    }
    const files = await this.attachmentService.findUploadFile({
      where: { page_id: pageId },
      order: { addtime: 'DESC' },
    });
    if (files.length == 0) {
      return sendResult([]);
    }

    if (!(await this.itemService.checkItemVisit(req.user['uid'], files[0].item_id))) {
      return sendError(10103);
    }
    const result = [];
    files.forEach((value) => {
      const url = value.sign ? `/api/attachment/visitFile/sign/${value.sign}` : value.real_url;
      result.push({
        file_id: value.file_id,
        display_name: value.display_name,
        url,
        addtime: timeString(value.addtime),
      });
    });
    return sendResult(result);
  }

  @ApiOperation({ summary: '页面的上传附件' })
  @UseGuards(JwtAuthGuard)
  @Post('pageAttachmentUpload')
  @UseInterceptors(FileInterceptor('file'))
  async pageAttachmentUpload(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() info: UploadListDto,
  ) {
    const pageId = parseInt(info.page_id);
    if (!pageId) {
      rmSync(file.path);
      return sendError(10103, '请至少先保存一次页面内容');
    }
    const itemId = parseInt(info.item_id);
    if (!(await this.itemService.checkItemPermn(req.user['uid'], itemId))) {
      rmSync(file.path);
      return sendError(10103);
    }
    const option = await this.commonService.findOneOption('oss_open');
    if (option && option.option_value == '1') {
      // TODO: 文件上传到 OSS
    }
    // 如果是在本地存放的文件，就不需要加域名了，后面域名改了不好弄了
    // const url = req.header('origin') + '/' + file.path;
    const url = '/' + file.path;
    const sign = createHash('md5').update(file.path).digest('hex');
    await this.attachmentService.saveUploadFile({
      sign: sign,
      uid: req.user['uid'],
      item_id: itemId,
      page_id: pageId,
      display_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size.toString(),
      real_url: url,
      addtime: now(),
    });
    return {
      success: 1,
      url: `/api/attachment/visitFile/sign/${sign}`,
    };
  }

  @ApiOperation({ summary: '删除页面中已上传文件' })
  @ApiBody({ schema: { example: { file_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('deletePageUploadFile')
  async deletePageUploadFile(@Req() req: Request, @Body('file_id') fileId: string) {
    const file = await this.attachmentService.findOneUploadFile({ uid: req.user['uid'], file_id: parseInt(fileId) });
    if (!file) {
      return sendError(10101, '删除失败');
    }
    if (!(await this.itemService.checkItemPermn(req.user['uid'], file.item_id))) {
      return sendError(10103);
    }

    await this.attachmentService.deleteFile(file.file_id);
    return sendResult([]);
  }

  @ApiOperation({ summary: '获取我的附件列表' })
  @UseGuards(JwtAuthGuard)
  @Post('getMyList')
  async getMyList(@Req() req: Request, @Body() myListDto: UploadMyListDto) {
    const files = await this.attachmentService.searchUploadFile(parseInt(myListDto.page), parseInt(myListDto.count), {
      display_name: myListDto.display_name,
      attachment_type: parseInt(myListDto.attachment_type),
      uid: req.user['uid'],
    });
    const lists = [];
    files[0].forEach((value) => {
      lists.push({
        file_id: value.file_id,
        file_type: value.file_type,
        file_size: value.file_size,
        visit_times: value.visit_times,
        uid: value.uid,
        item_id: value.item_id,
        page_id: value.page_id,
        file_size_m: (parseInt(value.file_size) / 1048576).toFixed(3),
        display_name: value.display_name ? value.display_name : '',
        url: value.sign ? `/api/attachment/visitFile/sign/${value.sign}` : value.real_url,
        addtime: timeString(value.addtime),
        last_visit_time: timeString(value.last_update_time),
      });
    });
    const used = await this.attachmentService.searchUploadFileSize(req.user['uid']);
    const flow = await this.attachmentService.getUserFlow(req.user['uid']);
    return sendResult({
      list: lists,
      total: files[1],
      used: used[0].count,
      used_m: (parseInt(used[0].count) / 1048576).toFixed(3),
      used_flow_m: (flow / 1048576).toFixed(3),
    });
  }

  @ApiOperation({ summary: '删除附件' })
  @ApiBody({ schema: { example: { file_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('deleteMyAttachment')
  async deleteMyAttachment(@Req() req: Request, @Body('file_id') fileId: string) {
    const file = await this.attachmentService.findOneUploadFile({ uid: req.user['uid'], file_id: parseInt(fileId) });
    if (!file) {
      return sendError(10101, '删除失败');
    }

    await this.attachmentService.deleteFile(file.file_id);
    return sendResult([]);
  }

  @ApiOperation({ summary: '获取全站的附件列表。给管理员查看附件用' })
  @UseGuards(JwtAdminGuard)
  @Post('getAllList')
  async getAllList(@Req() req: Request, @Body() myListDto: UploadMyListDto) {
    let uid: number;
    if (myListDto.username) {
      const user = await this.userService.findOne(myListDto.username);
      if (user) uid = user.uid;
    }
    const files = await this.attachmentService.searchUploadFile(parseInt(myListDto.page), parseInt(myListDto.count), {
      display_name: myListDto.display_name,
      attachment_type: parseInt(myListDto.attachment_type),
      uid,
    });
    const lists = [];
    await Promise.all(
      files[0].map(async (value) => {
        const u = await this.userService.findOneById(value.uid);
        lists.push({
          file_id: value.file_id,
          file_type: value.file_type,
          file_size: value.file_size,
          visit_times: value.visit_times,
          uid: value.uid,
          username: u ? u.username : '',
          item_id: value.item_id,
          page_id: value.page_id,
          file_size_m: (parseInt(value.file_size) / 1048576).toFixed(3),
          display_name: value.display_name ? value.display_name : '',
          url: value.sign ? `/api/attachment/visitFile/sign/${value.sign}` : value.real_url,
          addtime: timeString(value.addtime),
          last_visit_time: timeString(value.last_update_time),
        });
      }),
    );
    const used = await this.attachmentService.searchUploadFileSize(req.user['uid']);
    return sendResult({
      list: lists,
      total: files[1],
      used: used[0].count,
      used_m: (parseInt(used[0].count) / 1048576).toFixed(3),
    });
  }

  @ApiOperation({ summary: '删除附件。给管理员用' })
  @ApiBody({ schema: { example: { file_id: 'number' } } })
  @UseGuards(JwtAdminGuard)
  @Post('deleteAttachment')
  async deleteAttachment(@Req() req: Request, @Body('file_id') fileId: string) {
    const file = await this.attachmentService.findOneUploadFile({ uid: req.user['uid'], file_id: parseInt(fileId) });
    if (!file) {
      return sendError(10101, '删除失败');
    }

    await this.attachmentService.deleteFile(file.file_id);
    return sendResult([]);
  }
}
