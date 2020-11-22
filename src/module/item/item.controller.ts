import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { isNumberString } from 'class-validator';
import { Request } from 'express';
import { sendError, sendResult } from 'src/utils/send.util';
import { JwtAuthGuard, JwtNoAuthGuard } from '../auth/guard/jwt-auth.guard';
import { PageService } from '../page/page.service';
import { TeamService } from '../team/team.service';
import { ItemInfoDto } from './dto/info.dto';
import { ItemService } from './item.service';

@ApiTags('item')
@Controller('api/item')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly teamItemService: TeamService,
    private readonly pageService: PageService,
  ) {}

  @ApiOperation({ summary: '我的项目列表' })
  @UseGuards(JwtAuthGuard)
  @Post('myList')
  async myList(@Req() req: Request) {
    const itemIds = [];
    const itemMember = await this.itemService.findItemMember(req['user']['uid']);
    itemMember.forEach((value) => itemIds.push(value.item_id));
    const teamItemMember = await this.teamItemService.findItemMember(req['user']['uid']);
    teamItemMember.forEach((value) => itemIds.push(value.item_id));

    const items = await this.itemService.findItem(req['user']['uid'], itemIds);
    items.forEach((value) => {
      //判断是否为自己的项目
      value['creator'] = value.uid === req['user']['uid'] ? 1 : 0;
      if (!value['creator']) delete value['password'];
      //判断是否为私密项目
      value['is_private'] = value['password'] ? 1 : 0;
    });
    // TODO: 读取需要置顶的项目
    // TODO: 读取项目顺序
    return sendResult(items);
  }

  @ApiOperation({ summary: '获取项目信息' })
  @UseGuards(JwtNoAuthGuard)
  @Post('info')
  async info(@Req() req, @Body() info: ItemInfoDto) {
    if (typeof info.item_id == 'string') {
      if (!isNumberString(info.item_id)) info.item_domain = info.item_id;
      else info.item_id = parseInt(info.item_id);
    }
    if (info.item_domain) {
      const item = await this.itemService.findItemByDomain(info.item_domain);
      if (item) {
        info.item_id = item.item_id;
      }
    }
    // 项目 id 不为数字，说明域名对应的 项目 不存在
    if (typeof info.item_id != 'number') {
      return sendError(10101, '项目不存在或者已删除');
    }

    // TODO: 获取 uid
    const uid = req.user ? req.user.uid : 0;
    if (!(await this.itemService.checkItemVisit(uid, info.item_id))) {
      return sendError(10303);
    }

    const item = await this.itemService.findItemById(info.item_id);
    if (!item) {
      return sendError(10101, '项目不存在或者已删除');
    }

    // 下面获取组装项目信息
    const result = {
      item_id: item.item_id,
      item_domain: item.item_domain,
      item_name: item.item_name,
      item_type: item.item_type,
      is_archived: item.is_archived,
      current_page_id: info.page_id ? info.page_id : '',
      default_page_id: info.default_page_id,
      default_cat_id2: 0,
      default_cat_id3: 0,
      default_cat_id4: 0,
      unread_count: null,
      is_login: req.user ? true : false,
    };

    // 页面信息
    if (info.keyword) {
      result['menu'] = {
        catalogs: [],
        pages: await this.pageService.searchPage(item.item_id, info.keyword),
      };
    } else {
      const menu = await this.itemService.getMenu(item.item_id);
      if (uid > 0) {
        await this.itemService.filterMenu(uid, item.item_id, menu);
      }
      result['menu'] = menu;
    }

    // 如果有设置默认页面，则查找所在目录
    if (info.default_page_id) {
      const catalogs = await this.pageService.getPageCatalogLevel(
        typeof info.default_page_id == 'string' ? parseInt(info.default_page_id) : info.default_page_id,
      );
      result.default_cat_id2 = catalogs.default_cat_id2;
      result.default_cat_id3 = catalogs.default_cat_id3;
      result.default_cat_id4 = catalogs.default_cat_id4;
    }

    // 编辑权限
    result['ItemPermn'] = item.is_archived ? false : await this.itemService.checkItemPermn(uid, item.item_id);
    result['ItemCreator'] = item.is_archived ? false : await this.itemService.checkItemCreator(uid, item.item_id);

    return sendResult(result);
  }
}
