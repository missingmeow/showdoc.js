import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { now } from 'src/utils/utils.util';
import { DeepPartial, FindConditions, FindManyOptions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CatalogService } from '../catalog/catalog.service';
import { PageHistory } from './entity/page-history.entity';
import { PageLock } from './entity/page-lock.entity';
import { Page } from './entity/page.entity';
import { Recycle } from './entity/recycle.entity';
import { SinglePage } from './entity/single-page.entity';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(SinglePage)
    private readonly singlePageRepository: Repository<SinglePage>,
    @InjectRepository(Recycle)
    private readonly recycleRepository: Repository<Recycle>,
    @InjectRepository(PageHistory)
    private readonly pageHistoryRepository: Repository<PageHistory>,
    @InjectRepository(PageLock)
    private readonly pageLockRepository: Repository<PageLock>,
    private readonly catalogService: CatalogService,
  ) {}

  /**
   * 查找指定项目的所有页面
   * @param itemId 项目 id
   * @param option 可选选项，有默认值
   */
  async findPage(itemId: number, option?: { catalogId?: number; field?: string }): Promise<Page[]> {
    if (!option) option = {};
    const builder = this.pageRepository.createQueryBuilder().select('*');
    builder.where('item_id=:id and is_del=0', { id: itemId }).orderBy({ s_number: 'ASC', page_id: 'ASC' });
    if (option.field) {
      builder.select(option.field);
    }
    if (option.catalogId != undefined) {
      builder.andWhere('cat_id=:cid', { cid: option.catalogId });
    }
    return builder.execute();
  }

  async findPage2(uid: number, itemId: number) {
    const result: any[] = await this.pageRepository
      .createQueryBuilder()
      .select('*')
      .where('author_uid=:uid and item_id =:item_id', { uid, item_id: itemId })
      .orderBy('addtime', 'DESC')
      .limit(1)
      .execute();
    if (result.length == 0) {
      return { cat_id: 0 };
    }
    return result[0];
  }

  /**
   * 根据关键字查找某个项目的所有页面
   * @param itemId 项目 id
   * @param keyword 关键字
   */
  async searchPage(itemId: number, keyword: string) {
    keyword = keyword.trim();
    keyword = keyword.toLocaleLowerCase();
    return this.pageRepository
      .createQueryBuilder()
      .select('page_id,author_uid,cat_id,page_title,addtime')
      .where('item_id=:id', { id: itemId })
      .andWhere('(lower(page_title) like :keyword or lower(page_content) like :keyword )', {
        keyword: `%${keyword}%`,
      })
      .orderBy('s_number', 'ASC')
      .execute();
  }

  /**
   * 查找给定的页面所在的目录结构
   * @param pageId 页面 id
   */
  async getPageCatalogLevel(
    pageId: number,
  ): Promise<{ default_cat_id2: number; default_cat_id3: number; default_cat_id4: number }> {
    const result = { default_cat_id2: 0, default_cat_id3: 0, default_cat_id4: 0 };
    const page = await this.pageRepository.findOne({ page_id: pageId });
    if (page) {
      const cat3 = await this.catalogService.findCatalogById(page.cat_id);
      if (cat3 && cat3.parent_cat_id > 0) {
        const cat2 = await this.catalogService.findCatalogById(cat3.parent_cat_id);
        if (cat2 && cat2.parent_cat_id > 0) {
          result.default_cat_id2 = cat2.parent_cat_id;
          result.default_cat_id3 = cat3.parent_cat_id;
          result.default_cat_id4 = page.cat_id;
        } else {
          result.default_cat_id2 = cat3.parent_cat_id;
          result.default_cat_id3 = page.cat_id;
        }
      } else {
        result.default_cat_id2 = page.cat_id;
      }
    }
    return result;
  }

  /**
   * 根据页面 id 查找页面详情
   * @param pageId 页面 id
   */
  async findOnePage(pageId: number) {
    return this.pageRepository.findOne({ page_id: pageId });
  }

  async findOneSinglePage(pageId: number) {
    return this.singlePageRepository.findOne({ page_id: pageId });
  }

  async savePage(page: DeepPartial<Page>) {
    page.addtime = now();
    return this.pageRepository.save(page);
  }

  async updatePage(criteria: FindConditions<Page>, partialEntity: QueryDeepPartialEntity<Page>) {
    return this.pageRepository.update(criteria, partialEntity);
  }

  async deletePage(pageId: number, uid: number, username: string) {
    const page = await this.pageRepository.findOne(pageId);
    // 放入回收站
    await this.saveRecycle({
      id: undefined,
      item_id: page.item_id,
      page_id: page.page_id,
      page_title: page.page_title,
      del_by_uid: uid,
      del_by_username: username,
      del_time: now(),
    });
    // 软删除
    return this.pageRepository.update({ page_id: pageId }, { is_del: 1 });
  }

  async recoverPage(pageId: number) {
    return this.pageRepository.update({ page_id: pageId }, { is_del: 0, cat_id: 0 });
  }

  async findRecyleList(item_id: number) {
    return this.recycleRepository
      .createQueryBuilder()
      .select('*')
      .where('item_id=:item_id', { item_id })
      .orderBy('del_time', 'DESC')
      .execute();
  }

  async saveRecycle(recycle: Recycle) {
    return this.recycleRepository.save(recycle);
  }

  async deleteRecycle(itemId: number, pageId: number) {
    return this.recycleRepository.delete({ item_id: itemId, page_id: pageId });
  }

  async countPageHistory(conditions: FindConditions<PageHistory>) {
    return this.pageHistoryRepository.count(conditions);
  }

  async findPageHistory(options: FindManyOptions<PageHistory>) {
    return this.pageHistoryRepository.find(options);
  }

  async findOnePageHistory(conditions: FindConditions<PageHistory>) {
    return this.pageHistoryRepository.findOne(conditions);
  }

  async savePageHistory(pageHistory: DeepPartial<PageHistory>) {
    return this.pageHistoryRepository.save(pageHistory);
  }

  async deletePageHistory(pageId: number, historyId: number) {
    return this.pageHistoryRepository
      .createQueryBuilder()
      .where('page_id=:page_id', { page_id: pageId })
      .andWhere('page_history_id < :history_id', { history_id: historyId })
      .delete();
  }

  async findPageLock(options: FindManyOptions<PageLock>) {
    return this.pageLockRepository.find(options);
  }

  async savePageLock(pageLock: PageLock) {
    return this.pageLockRepository.save(pageLock);
  }

  async deletePageLock(pageId: number) {
    return this.pageLockRepository.delete({ page_id: pageId });
  }
}
