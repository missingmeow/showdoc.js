import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogService } from '../catalog/catalog.service';
import { Page } from './entity/page.entity';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
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
    builder.where('item_id=:id', { id: itemId }).orderBy({ s_number: 'ASC', page_id: 'ASC' });
    if (option.field) {
      builder.select(option.field);
    }
    if (option.catalogId) {
      builder.andWhere('cat_id=:cid', { cid: option.catalogId });
    }
    return builder.execute();
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
}
