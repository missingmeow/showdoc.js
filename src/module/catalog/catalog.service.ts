import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { timeString } from 'src/utils/utils.util';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Catalog } from './entity/catalog.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Catalog)
    private readonly catalogRepository: Repository<Catalog>,
  ) {}

  /**
   * 查找项目 id 的所有目录
   * @param itemId 项目 id
   * @param option 可选参数
   */
  async findCatalogByItem(itemId: number, option?: { field?: string; parentId?: number }): Promise<any[]> {
    if (!option) option = {};
    const builder = this.catalogRepository.createQueryBuilder().select('*');
    builder.where('item_id=:id', { id: itemId }).orderBy({ s_number: 'ASC', cat_id: 'ASC' });
    if (option.field) {
      builder.select(option.field);
    }
    if (option.parentId) {
      builder.andWhere('parent_cat_id=:pid', { pid: option.parentId });
    }
    return builder.execute();
  }

  /**
   * 通过目录 id 查找目录信息
   * @param catalogId 目录 id
   */
  async findCatalogById(catalogId: number) {
    return this.catalogRepository.findOne({ cat_id: catalogId });
  }

  /**
   * 保存一个目录
   * @param catalog 目录信息
   */
  async saveCatalog(catalog: Catalog) {
    return this.catalogRepository.save(catalog);
  }

  async updateCatalog(catalogId: number, partialEntity: QueryDeepPartialEntity<Catalog>) {
    return this.catalogRepository.update({ cat_id: catalogId }, partialEntity);
  }

  async deleteCatalog(catalogId: number, callbackFn: (catId: number) => Promise<any>) {
    //如果有子目录的话，递归把子目录清了
    const cats = await this.catalogRepository.find({ parent_cat_id: catalogId });
    await Promise.all(
      cats.map(async (value) => {
        await this.deleteCatalog(value.cat_id, callbackFn);
      }),
    );
    await callbackFn(catalogId);
    return this.catalogRepository.delete({ cat_id: catalogId });
  }

  async getList(itemId: number, isGroup?: boolean) {
    const catalogs = await this.catalogRepository
      .createQueryBuilder()
      .select('*')
      .where('item_id=:id', { id: itemId })
      .orderBy('s_number', 'ASC')
      .addOrderBy('cat_id', 'ASC')
      .execute();
    catalogs.forEach((element) => {
      element['addtime'] = timeString(element['addtime']);
    });
    if (isGroup) {
      return this._treeCatalog(0, catalogs);
    }
    return catalogs;
  }

  private _treeCatalog(catId: number, catalogs: any[]) {
    const root = [];
    catalogs.forEach((value) => {
      if (value.parent_cat_id == catId) {
        value['sub'] = this._treeCatalog(value.cat_id, catalogs);
        root.push(value);
      }
    });
    return root;
  }
}
