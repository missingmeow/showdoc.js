import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { timeString } from 'src/utils/utils.util';
import { AttachmentService } from '../attachment/attachment.service';
import { JwtAuthGuard, JwtNoAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ItemService } from '../item/item.service';
import { PageSortDto } from './dto/page.dto';
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

  @ApiOperation({ summary: '同一个目录下的页面排序' })
  @UseGuards(JwtAuthGuard)
  @Post('sort')
  async sort(@Req() req, @Body() sortDto: PageSortDto) {
    const itemId = parseInt(sortDto.item_id);
    if (!(await this.itemService.checkItemPermn(req.user.uid, itemId))) {
      return sendError(10103);
    }

    const pages = JSON.parse(sortDto.pages);
    for (const key in pages) {
      if (Object.prototype.hasOwnProperty.call(pages, key)) {
        await this.pageService.updatePage({ page_id: parseInt(key), item_id: itemId }, { s_number: pages[key] });
      }
    }
    return sendResult([]);
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

    await this.pageService.deletePage(pageId, req.user.uid, req.user.username);
    return sendResult(1);
  }
}
