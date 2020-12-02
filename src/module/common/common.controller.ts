import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { now, timeString } from 'src/utils/utils.util';
import { JwtAdminGuard, JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CatalogService } from '../catalog/catalog.service';
import { ItemService } from '../item/item.service';
import { UserService } from '../user/user.service';
import { CommonService } from './common.service';
import { AdminSaveConfigDto } from './dto/admin.dto';
import { MemberDeleteDto, MemberSaveDto } from './dto/member.dto';

@ApiTags('common')
@Controller('api')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    private readonly itemService: ItemService,
    private readonly catalogService: CatalogService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: '获取首页配置信息' })
  @Post('common/homePageSetting')
  async homePageSetting() {
    const homePage = await this.commonService.findOneOption('home_page');
    const homeItem = await this.commonService.findOneOption('home_item');
    const data = {};
    data['home_page'] = homePage ? homePage.option_value : false;
    data['home_item'] = homeItem ? homeItem.option_value : false;
    return sendResult(data);
  }

  @ApiOperation({ summary: '获取成员列表' })
  @ApiBody({ schema: { example: { item_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('member/getList')
  async memberGetList(@Req() req, @Body('item_id') itemId: number) {
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }
    const lists = await this.itemService.findItemMemberByItemId(itemId);
    await Promise.all(
      lists.map(async (value) => {
        value['addtime'] = timeString(value.addtime);
        value['member_group'] = value['member_group_id'] == 1 ? '编辑' : '只读';
        value['cat_name'] = '所有目录';
        if (value['cat_id'] > 0) {
          const catalog = await this.catalogService.findCatalogById(value.cat_id);
          if (catalog && catalog['cat_name']) {
            value['cat_name'] = catalog['cat_name'];
          }
        }
        value['member_group'] =
          value['member_group_id'] == 1 ? `编辑/目录：${value.cat_name}` : `只读/目录：${value['cat_name']}`;
      }),
    );
    return sendResult(lists);
  }

  @ApiOperation({ summary: '删除成员' })
  @UseGuards(JwtAuthGuard)
  @Post('member/delete')
  async memberDelete(@Req() req, @Body() memDto: MemberDeleteDto) {
    const itemId = parseInt(memDto.item_id);
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }

    await this.itemService.deleteItemMember({ item_id: itemId, item_member_id: parseInt(memDto.item_member_id) });
    return sendResult({});
  }

  @ApiOperation({ summary: '保存成员' })
  @UseGuards(JwtAuthGuard)
  @Post('member/save')
  async memberSave(@Req() req, @Body() memDto: MemberSaveDto) {
    const itemId = parseInt(memDto.item_id);
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }
    const userArr = memDto.username.split(',');
    let itemMember: any;
    await Promise.all(
      userArr.map(async (value) => {
        const user = await this.userService.findOne(value);
        if (!user) {
          return;
        }
        const itemMem = await this.itemService.findItemMember({ uid: user.uid, item_id: itemId });
        if (itemMem.length != 0) {
          return;
        }
        itemMember = await this.itemService.saveItemMember({
          username: user.username,
          uid: user.uid,
          item_id: itemId,
          member_group_id: parseInt(memDto.member_group_id),
          cat_id: parseInt(memDto.cat_id),
          addtime: now(),
          item_member_id: undefined,
        });
      }),
    );
    if (!itemMember) {
      return sendError(10101);
    }
    return sendResult(itemMember);
  }

  @ApiOperation({ summary: '加载配置' })
  @UseGuards(JwtAdminGuard)
  @Post('adminSetting/loadConfig')
  async loadConfig() {
    const ldap_open = await this.commonService.findOneOption('ldap_open');
    const oss_open = await this.commonService.findOneOption('oss_open');
    const register_open = await this.commonService.findOneOption('register_open');
    const ldap_form = await this.commonService.findOneOption('ldap_form');
    const oss_setting = await this.commonService.findOneOption('oss_setting');
    const home_page = await this.commonService.findOneOption('home_page');
    const home_item = await this.commonService.findOneOption('home_item');
    if (!register_open) {
      return sendResult([]);
    }
    return sendResult({
      ldap_open: ldap_open ? ldap_open.option_value : false,
      oss_open: oss_open ? oss_open.option_value : false,
      register_open: register_open ? register_open.option_value : false,
      home_page: home_page ? home_page.option_value : false,
      home_item: home_item ? home_item.option_value : false,
      ldap_form: ldap_form ? JSON.parse(ldap_form.option_value) : null,
      oss_setting: oss_setting ? JSON.parse(oss_setting.option_value) : null,
    });
  }

  @ApiOperation({ summary: '保存配置' })
  @UseGuards(JwtAdminGuard)
  @Post('adminSetting/saveConfig')
  async saveConfig(@Body() configDto: AdminSaveConfigDto) {
    await this.commonService.updateOption('register_open', configDto.register_open ? '1' : '0');
    await this.commonService.updateOption('home_page', configDto.home_page);
    await this.commonService.updateOption('home_item', configDto.home_item.toString());
    await this.commonService.updateOption('ldap_open', configDto.ldap_open ? '1' : '0');
    if (configDto.ldap_open) {
      // TODO: ldap 登录验证
      await this.commonService.updateOption('ldap_form', JSON.stringify(configDto.ldap_form));
    }
    await this.commonService.updateOption('oss_open', configDto.oss_open ? '1' : '0');
    if (configDto.oss_open) {
      await this.commonService.updateOption('oss_setting', JSON.stringify(configDto.oss_setting));
    }
    return sendResult([]);
  }
}
