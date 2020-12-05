import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { htmlspecialchars, now } from 'src/utils/utils.util';
import { FindConditions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CatalogService } from '../catalog/catalog.service';
import { Catalog } from '../catalog/entity/catalog.entity';
import { Page } from '../page/entity/page.entity';
import { PageService } from '../page/page.service';
import { TeamItem } from '../team/entity/team-item.entity';
import { TeamService } from '../team/team.service';
import { UserService } from '../user/user.service';
import { ItemMember } from './entity/item-member.entity';
import { ItemToken } from './entity/item-token.entity';
import { ItemTop } from './entity/item-top.entity';
import { Item } from './entity/item.entity';

@Injectable()
export class ItemService {
  constructor(
    private readonly teamService: TeamService,
    private readonly pageService: PageService,
    private readonly catalogService: CatalogService,
    private readonly userService: UserService,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemToken)
    private readonly itemTokenRepository: Repository<ItemToken>,
    @InjectRepository(ItemMember)
    private readonly itemMemberRepository: Repository<ItemMember>,
    @InjectRepository(ItemTop)
    private readonly itemTopRepository: Repository<ItemTop>,
  ) {}

  /**
   * 通过用户 id 或者项目 id 数组查找相关的所有项目（非删除项目）
   * @param uid 用户 id
   * @param itemIds 项目 id 数组
   */
  async findItem(uid: number, itemIds: number[]): Promise<any[]> {
    return this.itemRepository
      .createQueryBuilder()
      .select([
        'item_id',
        'uid',
        'item_name',
        'item_domain',
        'item_type',
        'last_update_time',
        'item_description',
        'is_del',
        'password',
      ])
      .where('(uid=:id OR item_id IN (:...ids))', { id: uid, ids: itemIds })
      .andWhere('is_del=:del', { del: 0 })
      .orderBy('item_id', 'ASC')
      .execute();
  }

  async findItemList(page: number, count: number, username: string, itemName: string) {
    const builder = this.itemRepository.createQueryBuilder();
    builder.offset((page - 1) * count);
    builder.limit(count);
    builder.where('is_del=0');
    if (username) {
      builder.andWhere('username like :user', { user: `%${username}%` });
    }
    if (itemName) {
      builder.andWhere('item_name like :item', { item: `%${itemName}%` });
    }
    builder.orderBy('addtime', 'DESC');
    return builder.getManyAndCount();
  }

  async findOneItem(conditions: FindConditions<Item>) {
    return this.itemRepository.findOne(conditions);
  }

  async findItemByTeamId(teamId) {
    return this.itemRepository
      .createQueryBuilder('item')
      .select('item.*, team_item.team_id, team_item.id as id')
      .leftJoin(TeamItem, 'team_item', 'item.item_id = team_item.item_id')
      .where('team_item.team_id=:id and item.is_del=0', { id: teamId })
      .execute();
  }

  async deleteItem(itemId: number) {
    return this.itemRepository.update({ item_id: itemId }, { is_del: 1, last_update_time: now() });
  }

  async archiveItem(itemId: number) {
    return this.itemRepository.update({ item_id: itemId }, { is_archived: 1, last_update_time: now() });
  }

  async attornItem(itemId: number, username: string, uid: number) {
    return this.itemRepository.update({ item_id: itemId }, { uid, username });
  }

  async saveItem(item: Item) {
    item.addtime = now();
    return await this.itemRepository.save(item);
  }

  async updateItem(itemId: number, partialEntity: QueryDeepPartialEntity<Item>) {
    return this.itemRepository.update({ item_id: itemId }, partialEntity);
  }

  private treeMenuNode(
    catalogId: number,
    allPages: any[],
    allCatalogs: any[],
    menu: { pages: any[]; catalogs: any[] },
  ) {
    allPages = allPages.filter((value) => {
      if (value['cat_id'] == catalogId) {
        menu.pages.push(value);
        return false;
      }
      return true;
    });
    allCatalogs = allCatalogs.filter((value) => {
      if (value['parent_cat_id'] == catalogId) {
        value.pages = [];
        value.catalogs = [];
        menu.catalogs.push(value);
        return false;
      }
      return true;
    });
    menu.catalogs.forEach((value) => {
      this.treeMenuNode(value['cat_id'], allPages, allCatalogs, value);
    });
  }

  /**
   * 获取菜单结构
   * @param itemId 项目 id
   */
  async getMenu(itemId: number) {
    // 获取项目的所有页面
    const allPages = await this.pageService.findPage(itemId, { field: 'page_id,author_uid,cat_id,page_title,addtime' });

    // 获取项目的所有目录
    const allCatalogs = await this.catalogService.findCatalogByItem(itemId);

    const menu = {
      pages: [],
      catalogs: [],
    };
    // 根据所有页面和目录整理树状结构
    this.treeMenuNode(0, allPages, allCatalogs, menu);
    return menu;
  }

  /**
   * 根据用户 id 过滤菜单的内容
   * @param uid 用户 id
   * @param itemId 项目 id
   * @param menu 菜单
   */
  async filterMenu(uid: number, itemId: number, menu: { pages: any[]; catalogs: any[] }): Promise<void> {
    let cat_id = 0;
    //首先看是否被添加为项目成员
    const itemMember = await this.itemMemberRepository.findOne({ uid, item_id: itemId });
    if (itemMember && itemMember['cat_id'] > 0) {
      cat_id = itemMember['cat_id'];
    }
    //再看是否添加为团队-项目成员
    const teamItemMember = await this.teamService.findTeamItemMemberByUid(uid, itemId);
    if (teamItemMember.length != 0 && teamItemMember[0]['cat_id'] > 0) {
      cat_id = teamItemMember[0]['cat_id'];
    }
    //开始根据cat_id过滤
    if (cat_id > 0) {
      menu['catalogs'] = menu['catalogs'].filter((value) => {
        return value['cat_id'] == cat_id;
      });
    }
  }

  /**
   * 判断某用户是否有项目管理权限（项目成员member_group_id为1，是项目所在团队的成员并且成员权限为1 ，以及 项目创建者）
   * @param uid 用户 id
   * @param itemId 项目 id
   */
  async checkItemPermn(uid: number, itemId: number) {
    if (!uid) {
      return false;
    }

    const item = await this.itemRepository.findOne({ item_id: itemId, uid });
    if (item) {
      return true;
    }

    const itemM = await this.itemMemberRepository.findOne({ item_id: itemId, uid, member_group_id: 1 });
    if (itemM) {
      return true;
    }

    const tItemM = await this.teamService.findTeamItemMemberByUid(uid, itemId, 1);
    if (tItemM.length != 0) {
      return true;
    }

    return false;
  }

  /**
   * 判断某用户是否为项目创建者
   * @param uid 用户 id
   * @param itemId 项目 id
   */
  async checkItemCreator(uid: number, itemId: number): Promise<boolean> {
    if (!uid) {
      return false;
    }

    const item = await this.itemRepository.findOne({ item_id: itemId, uid });
    if (item) {
      return true;
    }
    return false;
  }

  /**
   * 判断某用户是否有项目访问权限（公开项目的话所有人可访问，私有项目则项目成员、项目创建者和访问密码输入者可访问）
   * @param uid 用户 id
   * @param itemId 项目 id
   */
  async checkItemVisit(uid: number, itemId: number): Promise<boolean> {
    if (await this.checkItemCreator(uid, itemId)) {
      return true;
    }

    const itemM = await this.itemMemberRepository.findOne({ item_id: itemId, uid });
    if (itemM) {
      return true;
    }

    const titemM = await this.teamService.findTeamItemMemberByUid(uid, itemId);
    if (titemM.length != 0) {
      return true;
    }

    const item = await this.itemRepository.findOne({ item_id: itemId });
    if (item && item.password) {
      return false;
    }
    return true;
  }

  /**
   * 导出某个项目的内容，以 json 字符串返回
   * @param itemId 项目 id
   */
  async exportItem(itemId: number): Promise<string> {
    const item = (
      await this.itemRepository
        .createQueryBuilder()
        .select('item_type,item_name,item_description,password')
        .where('item_id=:id', { id: itemId })
        .execute()
    )[0];

    // 获取项目的所有页面
    const allPages = await this.pageService.findPage(itemId, {
      field: 'page_title,cat_id,page_content,s_number,page_comments',
    });
    // 获取项目的所有目录
    const allCatalogs = await this.catalogService.findCatalogByItem(itemId, {
      field: 'cat_id,cat_name ,parent_cat_id,level,s_number',
    });

    const menu = {
      pages: [],
      catalogs: [],
    };
    // 根据所有页面和目录整理树状结构
    this.treeMenuNode(0, allPages, allCatalogs, menu);
    item['pages'] = menu;
    item['members'] = await this.itemMemberRepository
      .createQueryBuilder()
      .select('member_group_id ,uid,username')
      .where('item_id=:id', { id: itemId })
      .execute();

    return JSON.stringify(item);
  }

  /**
   * 导入项目内容，以 json 字符串传进来
   * @param itemContent 项目内容
   * @param uid 当前用户 id
   * @param option 可选选项
   */
  async importItem(
    itemContent: string,
    uid: number,
    option?: {
      item_name?: string;
      item_description?: string;
      item_password?: string;
      item_domain?: string;
    },
  ) {
    if (!option) option = {};
    const item = JSON.parse(itemContent);
    const user = await this.userService.findOneById(uid);
    if (!item) {
      return false;
    }
    const newItem = new Item();
    if (item.item_domain) {
      if (await this.itemRepository.findOne({ item_domain: item.item_domain })) {
        return false;
      }
      newItem.item_domain = item.item_domain;
    }
    newItem.item_name = htmlspecialchars(option.item_name ? option.item_name : item.item.name);
    newItem.item_domain = htmlspecialchars(option.item_domain ? option.item_domain : item.item_domain);
    newItem.item_type = item.item_type;
    newItem.item_description = htmlspecialchars(
      option.item_description ? option.item_description : item.item_description,
    );
    newItem.password = htmlspecialchars(option.item_password ? option.item_password : item.item_password);
    newItem.uid = uid;
    newItem.username = user.username;
    newItem.addtime = now();
    const i = await this.itemRepository.save(newItem);
    if (item.pages) {
      await this.exportMenu(item.pages, {
        item_id: i.item_id,
        catalogId: 0,
        level: 2,
        uid: user.uid,
        username: user.username,
      });
    }
    if (item.members) {
      // 不再导入成员数据 ItemMember
    }
    return i.item_id;
  }

  /**
   * 导入菜单的结构数据
   * @param menu 菜单
   * @param option 选项
   */
  private async exportMenu(
    menu: { pages?: any[]; catalogs?: any[] },
    option: {
      item_id: number;
      catalogId: number;
      level: number;
      uid: number;
      username: string;
    },
  ) {
    if (menu.catalogs) {
      menu.catalogs.forEach(async (value) => {
        const catalog = new Catalog();
        catalog.cat_name = htmlspecialchars(value.cat_name);
        catalog.s_number = value.s_number;
        catalog.level = option.level;
        catalog.item_id = option.item_id;
        catalog.parent_cat_id = option.catalogId;
        catalog.addtime = now();
        const newCata = await this.catalogService.saveCatalog(catalog);

        await this.exportMenu(value, {
          item_id: option.item_id,
          catalogId: newCata.cat_id,
          level: option.level + 1,
          uid: option.uid,
          username: option.username,
        });
      });
    }
    if (menu.pages) {
      menu.pages.forEach(async (value) => {
        const page = new Page();
        page.author_uid = option.uid;
        page.author_username = option.username;
        page.page_title = htmlspecialchars(value.page_title);
        page.page_content = htmlspecialchars(value.page_content);
        page.page_comments = htmlspecialchars(value.page_comments);
        page.s_number = parseInt(value.s_number);
        page.item_id = option.item_id;
        page.cat_id = option.catalogId;
        page.addtime = now();
        await this.pageService.savePage(page);
      });
    }
  }

  /**
   * 通过部分条件查找关联的所有项目
   * @param option 可选项
   */
  async findItemMember(option: { uid?: number; item_id?: number; item_member_id?: number }): Promise<ItemMember[]> {
    return this.itemMemberRepository.find(option);
  }

  async findItemMemberByItemId(itemId: number) {
    return await this.itemMemberRepository
      .createQueryBuilder('item_member')
      .select('item_member.* , user.name as name')
      .leftJoin('user', 'user', 'user.uid = item_member.uid')
      .where('item_id=:id', { id: itemId })
      .orderBy('addtime', 'ASC')
      .execute();
  }

  async countItemMember(itemId: number) {
    return this.itemMemberRepository.count({ item_id: itemId });
  }

  async deleteItemMember(criteria: FindConditions<ItemMember>) {
    return this.itemMemberRepository.delete(criteria);
  }

  async saveItemMember(itemMember: ItemMember) {
    return this.itemMemberRepository.save(itemMember);
  }

  async createItemToken(itemId: number) {
    const itemToken = new ItemToken();
    itemToken.api_key = createHash('md5')
      .update(itemId.toString() + Date.now().toString() + Math.random().toString() + 'missingmeow1991' + 'key')
      .digest('hex');
    itemToken.api_token = createHash('md5')
      .update(itemId.toString() + Date.now().toString() + Math.random().toString() + 'missingmeow1997' + 'token')
      .digest('hex');
    itemToken.item_id = itemId;
    itemToken.addtime = now();
    return this.itemTokenRepository.save(itemToken);
  }

  async getItemTokenByItemId(itemId: number) {
    const item = await this.itemTokenRepository.findOne({ item_id: itemId });
    if (!item) {
      return this.createItemToken(itemId);
    }
    return item;
  }

  async deleteItemTokenByItemId(itemId: number) {
    return this.itemTokenRepository.delete({ item_id: itemId });
  }

  async deleteItemTop(criteria: FindConditions<ItemTop>) {
    return this.itemTopRepository.delete(criteria);
  }
}
