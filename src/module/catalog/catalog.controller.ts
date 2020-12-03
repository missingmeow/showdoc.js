import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { now } from 'src/utils/utils.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ItemService } from '../item/item.service';
import { PageService } from '../page/page.service';
import { CatalogService } from './catalog.service';
import { CatalogPageDto, CatalogSaveDto } from './dto/catalog.dto';

@ApiTags('catalog')
@Controller('api/catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly itemService: ItemService,
    private readonly pageService: PageService,
  ) {}

  @ApiOperation({ summary: '获取目录列表' })
  @ApiBody({ schema: { example: { item_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('catListGroup')
  async catListGroup(@Req() req, @Body('item_id') itemId: number) {
    if (!(await this.itemService.checkItemVisit(req.user.uid, itemId))) {
      return sendError(10103);
    }
    const catalogs = await this.catalogService.getList(itemId, true);
    return sendResult(catalogs);
  }

  @ApiOperation({ summary: '保存目录' })
  @UseGuards(JwtAuthGuard)
  @Post('save')
  async save(@Req() req, @Body() saveDto: CatalogSaveDto) {
    const itemId = parseInt(saveDto.item_id);
    if (!(await this.itemService.checkItemPermn(req.user.uid, itemId))) {
      return sendError(10103);
    }
    const catId = parseInt(saveDto.cat_id) ? parseInt(saveDto.cat_id) : 0;
    const parentCatId = parseInt(saveDto.parent_cat_id) ? parseInt(saveDto.parent_cat_id) : 0;
    let level = 2;
    if (parentCatId) {
      if (catId == parentCatId) {
        return sendError(10101, '上级目录不能选择自身');
      }
      const parentCata = await this.catalogService.findCatalogById(parentCatId);
      level = parentCata.level + 1;
    }
    let result;
    if (catId) {
      const cata = await this.catalogService.findCatalogById(catId);
      if (!(await this.itemService.checkItemPermn(req.user.uid, cata.item_id))) {
        return sendError(10103);
      }
      await this.catalogService.updateCatalog(catId, {
        cat_name: saveDto.cat_name,
        s_number: saveDto.s_number ? parseInt(saveDto.s_number) : undefined,
        item_id: itemId,
        parent_cat_id: parentCatId,
        level: level,
      });
      result = await this.catalogService.findCatalogById(catId);
    } else {
      result = await this.catalogService.saveCatalog({
        cat_id: undefined,
        cat_name: saveDto.cat_name,
        s_number: saveDto.s_number ? parseInt(saveDto.s_number) : undefined,
        item_id: itemId,
        parent_cat_id: parentCatId,
        level: level,
        addtime: now(),
      });
    }

    if (!result) {
      return sendError(10103, 'request fail');
    }
    return sendResult(result);
  }

  @ApiOperation({ summary: '删除目录' })
  @ApiBody({ schema: { example: { cat_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('delete')
  async delete(@Req() req, @Body('cat_id') catId: number) {
    const catalog = await this.catalogService.findCatalogById(catId);
    if (!catalog || !(await this.itemService.checkItemPermn(req.user.uid, catalog.item_id))) {
      return sendError(10103);
    }
    // 清掉目录
    await this.catalogService.deleteCatalog(catId, async (catalogId) => {
      // 清掉页面
      const catalog = await this.catalogService.findCatalogById(catalogId);
      const pages = await this.pageService.findPage(catalog.item_id, { catalogId, field: 'page_id' });
      await Promise.all(
        pages.map(async (value) => {
          await this.pageService.deletePage(value.page_id, req.user.uid, req.user.username);
        }),
      );
    });
    return sendResult([]);
  }

  @ApiOperation({ summary: '获取某个目录下所有页面的标题' })
  @UseGuards(JwtAuthGuard)
  @Post('getPagesBycat')
  async getPagesBycat(@Req() req, @Body() pageDto: CatalogPageDto) {
    const itemId = parseInt(pageDto.item_id);
    if (!(await this.itemService.checkItemPermn(req.user.uid, itemId))) {
      return sendError(10103);
    }
    const result = await this.pageService.findPage(itemId, {
      catalogId: parseInt(pageDto.cat_id),
      field: 'page_id, page_title, s_number',
    });
    return sendResult(result);
  }
}
