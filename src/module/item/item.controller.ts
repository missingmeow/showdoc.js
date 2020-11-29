import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { isAlphanumeric, isNumberString } from 'class-validator';
import { Request } from 'express';
import { sendError, sendResult } from 'src/utils/send.util';
import { JwtAuthGuard, JwtNoAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Page } from '../page/entity/page.entity';
import { PageService } from '../page/page.service';
import { TeamService } from '../team/team.service';
import { UserService } from '../user/user.service';
import { ItemAddDto } from './dto/item-add.dto';
import { ItemDeleteDto, ItemAttornDto } from './dto/item.dto';
import { ItemInfoDto } from './dto/item-info.dto';
import { Item } from './entity/item.entity';
import { ItemService } from './item.service';

@ApiTags('item')
@Controller('api/item')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly teamItemService: TeamService,
    private readonly pageService: PageService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: '我的项目列表' })
  @UseGuards(JwtAuthGuard)
  @Post('myList')
  async myList(@Req() req: Request) {
    const itemIds = [];
    const itemMember = await this.itemService.findItemMember(req['user']['uid']);
    itemMember.forEach((value) => itemIds.push(value.item_id));
    const teamItemMember = await this.teamItemService.findTeamItemMemberByUid(req['user']['uid']);
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

  @ApiOperation({ summary: '我的项目列表，同 POST 方法' })
  @UseGuards(JwtAuthGuard)
  @Get('myList')
  async getMyList(@Req() req: Request) {
    return this.myList(req);
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

  @ApiOperation({ summary: '新建项目' })
  @UseGuards(JwtAuthGuard)
  @Post('add')
  async add(@Req() req, @Body() addDto: ItemAddDto) {
    if (addDto.item_domain) {
      if (!isAlphanumeric(addDto.item_domain)) {
        return sendError(10305);
      }
      if (await this.itemService.findItemByDomain(addDto.item_domain)) {
        return sendError(10304);
      }
    }
    if (addDto.copy_item_id) {
      if (!(await this.itemService.checkItemPermn(req.user.uid, Number.parseInt(addDto.copy_item_id)))) {
        return sendError(10103);
      }
      const itemId = await this.itemService.importItem(
        await this.itemService.exportItem(parseInt(addDto.copy_item_id)),
        req.user.uid,
        addDto,
      );
      if (itemId) {
        return sendResult({ item_id: itemId });
      }
      return sendError(10101);
    }
    const item_type = parseInt(addDto.item_type);
    const item = new Item();
    item.uid = req.user.uid;
    item.username = req.user.username;
    item.item_name = addDto.item_name;
    item.password = addDto.password;
    item.item_description = addDto.item_description;
    item.item_domain = addDto.item_domain;
    item.item_type = item_type;
    const newItem = await this.itemService.saveItem(item);
    if (!newItem) {
      return sendError(10101);
    }

    if (item_type == 2) {
      //如果是单页应用，则新建一个默认页
      const page = new Page();
      page.author_uid = req.user.uid;
      page.author_username = req.user.username;
      page.page_title = addDto.item_name;
      page.item_id = newItem.item_id;
      page.cat_id = 0;
      page.page_content = '欢迎使用showdoc。点击右上方的编辑按钮进行编辑吧！';
      await this.pageService.save(page);
    } else if (item_type == 4) {
      //如果是表格应用，则新建一个默认页
      const page = new Page();
      page.author_uid = req.user.uid;
      page.author_username = req.user.username;
      page.page_title = addDto.item_name;
      page.item_id = newItem.item_id;
      page.cat_id = 0;
      page.page_content = '';
      await this.pageService.save(page);
    }

    return sendResult({ item_id: newItem.item_id });
  }

  @ApiOperation({ summary: '项目详情' })
  @ApiBody({ schema: { example: { item_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('detail')
  async detail(@Req() req, @Body('item_id') itemId: number) {
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }
    const item = await this.itemService.findItemById(itemId);
    return sendResult(item ? item : {});
  }

  @ApiOperation({ summary: '获取项目分享 key 值' })
  @ApiBody({ schema: { example: { item_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('getKey')
  async getKey(@Req() req, @Body('item_id') itemId: number) {
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }
    const item = await this.itemService.getItemTokenByItemId(itemId);
    if (!item) {
      sendError(10101);
    }
    return sendResult(item);
  }

  @ApiOperation({ summary: '重置项目分享 key 值' })
  @ApiBody({ schema: { example: { item_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('resetKey')
  async resetKey(@Req() req, @Body('item_id') itemId: number) {
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }
    await this.itemService.deleteItemTokenByItemId(itemId);
    const item = await this.itemService.getItemTokenByItemId(itemId);
    if (!item) {
      sendError(10101);
    }
    return sendResult(item);
  }

  @ApiOperation({ summary: '删除项目' })
  @UseGuards(JwtAuthGuard)
  @Post('delete')
  async delete(@Req() req, @Body() delDto: ItemDeleteDto) {
    const itemId = parseInt(delDto.item_id);
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }
    if (!(await this.userService.checkPassword(req.user.uid, delDto.password))) {
      return sendError(10208);
    }
    const result = await this.itemService.deleteItem(itemId);
    if (result.affected == 0) {
      return sendError(10101);
    }
    return sendResult(result.affected);
  }

  @ApiOperation({ summary: '归档项目' })
  @UseGuards(JwtAuthGuard)
  @Post('archive')
  async archive(@Req() req, @Body() delDto: ItemDeleteDto) {
    const itemId = parseInt(delDto.item_id);
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }
    if (!(await this.userService.checkPassword(req.user.uid, delDto.password))) {
      return sendError(10208);
    }
    const result = await this.itemService.archiveItem(itemId);
    if (result.affected == 0) {
      return sendError(10101);
    }
    return sendResult(result.affected);
  }

  @ApiOperation({ summary: '转让项目' })
  @UseGuards(JwtAuthGuard)
  @Post('attorn')
  async attorn(@Req() req, @Body() attornDto: ItemAttornDto) {
    const itemId = parseInt(attornDto.item_id);
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }
    if (!(await this.userService.checkPassword(req.user.uid, attornDto.password))) {
      return sendError(10208);
    }

    const user = await this.userService.findOne(attornDto.username);
    if (!user) {
      return sendError(10209);
    }

    await this.itemService.attornItem(itemId, user.username, user.uid);
    const item = await this.itemService.findItemById(itemId);
    if (!item) {
      return sendError(10101);
    }
    return sendResult(item);
  }
}
