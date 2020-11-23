import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { timeString } from 'src/utils/utils.util';
import { AttachmentService } from '../attachment/attachment.service';
import { JwtNoAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ItemService } from '../item/item.service';
import { PageService } from './page.service';

@Controller('api/page')
export class PageController {
  constructor(
    private readonly pageService: PageService,
    private readonly itemService: ItemService,
    private readonly attachmentService: AttachmentService,
  ) {}

  @ApiOperation({ summary: '获取页面具体详情' })
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
}
