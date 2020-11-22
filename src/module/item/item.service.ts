import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogService } from '../catalog/catalog.service';
import { PageService } from '../page/page.service';
import { TeamService } from '../team/team.service';
import { ItemMember } from './entity/item-member.entity';
import { Item } from './entity/item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemMember)
    private readonly itemMemberRepository: Repository<ItemMember>,
    private readonly teamService: TeamService,
    private readonly pageService: PageService,
    private readonly catalogService: CatalogService,
  ) {}

  async findAllItem(): Promise<Item[]> {
    return this.itemRepository.find();
  }

  /**
   * 通过用户 id 查找关联的所有项目
   * @param uid 用户 id
   */
  async findItemMember(uid: number): Promise<ItemMember[]> {
    return this.itemMemberRepository.find({ uid });
  }

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

  /**
   * 根据项目域名查找项目信息
   * @param domain 域名
   */
  async findItemByDomain(domain: string): Promise<Item> {
    return this.itemRepository.findOne({ item_domain: domain });
  }

  /**
   * 根据项目 id 获取项目信息
   * @param itemId 项目 id
   */
  async findItemById(itemId: number): Promise<Item> {
    return this.itemRepository.findOne({ item_id: itemId, is_del: 0 });
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
    const teamItemMember = await this.teamService.findItemMember(uid, itemId);
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

    const tItemM = await this.teamService.findItemMember(uid, itemId, 1);
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

    const titemM = await this.teamService.findItemMember(uid, itemId);
    if (titemM.length != 0) {
      return true;
    }

    const item = await this.itemRepository.findOne({ item_id: itemId });
    if (item && item.password) {
      return false;
    }
    return true;
  }
}
