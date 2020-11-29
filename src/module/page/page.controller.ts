import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { now, timeString } from 'src/utils/utils.util';
import { AttachmentService } from '../attachment/attachment.service';
import { JwtAuthGuard, JwtNoAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ItemService } from '../item/item.service';
import { PageService } from './page.service';

@ApiTags('page')
@Controller('api/page')
export class PageController {
  constructor(
    private readonly pageService: PageService,
    private readonly itemService: ItemService,
    private readonly attachmentService: AttachmentService,
  ) {}

  @ApiOperation({ summary: '获取页面具体详情' })
  @ApiBody({ schema: { example: { page_id: 'number' } } })
  @UseGuards(JwtNoAuthGuard)
  @Post('info')
  async info(@Req() req, @Body('page_id') pageId: number) {
    const page: any = await this.pageService.findOnePage(pageId);
    if (!page || page.is_del) {
      return sendError(10101);
    }

    const uid = req.user ? req.user['uid'] : 0;
    if (!(await this.itemService.checkItemVisit(uid, page.item_id))) {
      return sendError(10103);
    }

    page['addtime'] = timeString(page.addtime);

    page['attachment_count'] = await this.attachmentService.countPage(pageId);

    const singlePage = await this.pageService.findOneSinglePage(pageId);
    page['unique_key'] = singlePage ? singlePage.unique_key : '';
    return sendResult(page);
  }

  @ApiOperation({ summary: '删除页面' })
  @ApiBody({ schema: { example: { page_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('delete')
  async delete(@Req() req, @Body('page_id') pageId: number) {
    const page = await this.pageService.findOnePage(pageId);
    if (!page) {
      return sendError(10303);
    }
    if (!(await this.itemService.checkItemCreator(req.user.uid, page.item_id)) && page.author_uid != req.user.uid) {
      return sendError(10303);
    }

    await this.pageService.saveRecycle({
      id: undefined,
      item_id: page.item_id,
      page_id: page.page_id,
      page_title: page.page_title,
      del_by_uid: req.user.uid,
      del_by_username: req.user.username,
      del_time: now(),
    });
    await this.pageService.deletePage(pageId);
    return sendResult(1);
  }
}
