import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { sendError, sendResult } from 'src/utils/send.util';
import { now, timeString } from 'src/utils/utils.util';
import { deflateSync, inflateSync } from 'zlib';
import { AttachmentService } from '../attachment/attachment.service';
import { JwtAuthGuard, JwtNoAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ItemService } from '../item/item.service';
import { PageDiffDto, PageLockDto, PageSaveDto, PageSortDto } from './dto/page.dto';
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
  async info(@Req() req: Request, @Body('page_id') pageId: number) {
    const page: any = await this.pageService.findOnePage(pageId);
    if (!page || page.is_del) {
      return sendError(10101);
    }

    const uid = req.user ? req.user['uid'] : 0;
    if (!(await this.itemService.checkItemVisit(uid, page.item_id, req.session))) {
      return sendError(10103);
    }

    page['addtime'] = timeString(page.addtime);

    page['attachment_count'] = await this.attachmentService.countUploadFile(pageId);

    const singlePage = await this.pageService.findOneSinglePage(pageId);
    page['unique_key'] = singlePage ? singlePage.unique_key : '';
    return sendResult(page);
  }

  @ApiOperation({ summary: '保存' })
  @UseGuards(JwtAuthGuard)
  @Post('save')
  async save(@Req() req: Request, @Body() saveDto: PageSaveDto) {
    const itemId = parseInt(saveDto.item_id);
    if (!(await this.itemService.checkItemPermn(req.user['uid'], itemId, req.session))) {
      return sendError(10103);
    }
    if (!saveDto.page_content) {
      return sendError(10103, '不允许保存空内容，请随便写点什么');
    }
    if (parseInt(saveDto.is_urlencode)) {
      saveDto.page_content = decodeURIComponent(saveDto.page_content);
    }
    const pageId = parseInt(saveDto.page_id);
    if (!pageId) {
      const page = await this.pageService.savePage({
        item_id: itemId,
        cat_id: parseInt(saveDto.cat_id) ? parseInt(saveDto.cat_id) : 0,
        page_title: saveDto.page_title ? saveDto.page_title : '默认标题',
        page_content: saveDto.page_content,
        page_comments: saveDto.page_comments ? saveDto.page_comments : '',
        author_uid: req.user['uid'],
        author_username: req.user['username'],
        s_number: saveDto.s_number ? parseInt(saveDto.s_number) : undefined,
      });
      await this.itemService.updateItem(itemId, { last_update_time: now() });
      return sendResult(page);
    }
    // 在保存前先把当前页面的版本存档
    const lastPage = await this.pageService.findOnePage(pageId);
    if (!(await this.itemService.checkItemPermn(req.user['uid'], lastPage.item_id, req.session))) {
      return sendError(10103);
    }

    await this.pageService.savePageHistory({
      page_id: lastPage.page_id,
      item_id: lastPage.item_id,
      cat_id: lastPage.cat_id,
      page_title: lastPage.page_title,
      page_comments: lastPage.page_comments,
      page_content: deflateSync(lastPage.page_content, { level: 9 }).toString('base64'),
      s_number: lastPage.s_number,
      addtime: lastPage.addtime,
      author_uid: lastPage.author_uid,
      author_username: lastPage.author_username,
    });
    await this.pageService.updatePage(
      { page_id: pageId },
      {
        item_id: itemId,
        cat_id: parseInt(saveDto.cat_id) ? parseInt(saveDto.cat_id) : 0,
        page_title: saveDto.page_title ? saveDto.page_title : '默认标题',
        page_content: saveDto.page_content,
        page_comments: saveDto.page_comments ? saveDto.page_comments : '',
        author_uid: req.user['uid'],
        author_username: req.user['username'],
        s_number: saveDto.s_number ? parseInt(saveDto.s_number) : undefined,
      },
    );
    // 统计该page_id有多少历史版本了
    const count = await this.pageService.countPageHistory({ page_id: pageId });
    if (count > 20) {
      // 每个单页面只保留最多20个历史版本
      const pageHis = await this.pageService.findPageHistory({
        take: 20,
        where: { page_id: pageId },
        order: { page_history_id: 'DESC' },
      });
      await this.pageService.deletePageHistory(pageId, pageHis[19].page_history_id);
    }

    const newPage = await this.pageService.findOnePage(pageId);
    //如果是单页项目，则将页面标题设置为项目名
    const item = await this.itemService.findOneItem({ item_id: itemId });
    if (item.item_type == 2) {
      await this.itemService.updateItem(itemId, { item_name: newPage.page_title, last_update_time: now() });
    } else {
      await this.itemService.updateItem(itemId, { last_update_time: now() });
    }
    return sendResult(newPage);
  }

  @ApiOperation({ summary: '同一个目录下的页面排序' })
  @UseGuards(JwtAuthGuard)
  @Post('sort')
  async sort(@Req() req, @Body() sortDto: PageSortDto) {
    const itemId = parseInt(sortDto.item_id);
    if (!(await this.itemService.checkItemPermn(req.user.uid, itemId, req.session))) {
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

  @ApiOperation({ summary: '历史版本列表' })
  @ApiBody({ schema: { example: { page_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('history')
  async history(@Req() req, @Body('page_id') pageId: number) {
    const page = await this.pageService.findOnePage(pageId);
    if (!page) {
      return sendError(10303);
    }
    if (!(await this.itemService.checkItemVisit(req.user.uid, page.item_id, req.session))) {
      return sendError(10303);
    }

    const pageHis: any[] = await this.pageService.findPageHistory({
      take: 20,
      where: { page_id: pageId },
      order: { page_history_id: 'DESC' },
    });
    await Promise.all(
      pageHis.map(async (value) => {
        value.addtime = timeString(value.addtime);
        value.page_content = inflateSync(Buffer.from(value.page_content, 'base64')).toString();
      }),
    );
    return sendResult(pageHis);
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
    if (
      !(await this.itemService.checkItemCreator(req.user.uid, page.item_id, req.session)) &&
      page.author_uid != req.user.uid
    ) {
      return sendError(10303);
    }

    await this.pageService.deletePage(pageId, req.user.uid, req.user.username);
    return sendResult(1);
  }

  @ApiOperation({ summary: '判断页面是否加了编辑锁' })
  @ApiBody({ schema: { example: { page_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('isLock')
  async isLock(@Req() req, @Body('page_id') pageId: number) {
    const pages = await this.pageService.findPageLock({
      where: { page_id: pageId },
      order: { lock_to: 'DESC' },
      take: 1,
    });
    if (pages.length == 0 || pages[0].lock_to < now()) {
      return sendResult({ lock: 0, lock_uid: '', lock_username: '', is_cur_user: 0 });
    }
    return sendResult({
      lock: 1,
      lock_uid: pages[0].lock_uid,
      lock_username: pages[0].lock_username,
      is_cur_user: req.user.uid == pages[0].lock_uid ? 1 : 0,
    });
  }

  @ApiOperation({ summary: '设置页面加锁时间' })
  @UseGuards(JwtAuthGuard)
  @Post('setLock')
  async setLock(@Req() req, @Body() lockDto: PageLockDto) {
    const itemId = parseInt(lockDto.item_id);
    if (!(await this.itemService.checkItemPermn(req.user.uid, itemId, req.session))) {
      return sendError(10103);
    }

    const pageId = parseInt(lockDto.page_id);
    await this.pageService.deletePageLock(pageId);
    const lock = await this.pageService.savePageLock({
      id: undefined,
      page_id: pageId,
      lock_uid: req.user.uid,
      lock_username: req.user.username,
      lock_to: parseInt(lockDto.lock_to) ? parseInt(lockDto.lock_to) : now() + 5 * 60 * 60,
      addtime: now(),
    });
    // TODO: 删除当前时间之前的记录 -- 用定时器更好
    return sendResult({ id: lock.id });
  }

  @ApiOperation({ summary: '返回当前页面和历史某个版本的页面以供比较' })
  @UseGuards(JwtAuthGuard)
  @Post('diff')
  async diff(@Req() req, @Body() diffDto: PageDiffDto) {
    const pageId = parseInt(diffDto.page_id);
    const page = await this.pageService.findOnePage(pageId);
    if (!page) {
      return sendError(10101);
    }
    if (!(await this.itemService.checkItemVisit(req.user.uid, page.item_id, req.session))) {
      return sendError(10303);
    }
    const pageHis = await this.pageService.findOnePageHistory({ page_history_id: parseInt(diffDto.page_history_id) });
    const content = inflateSync(Buffer.from(pageHis.page_content, 'base64')).toString();
    pageHis.page_content = content ? content : pageHis.page_content;
    return sendResult({
      page,
      history_page: pageHis,
    });
  }
}
