import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ItemService } from '../item/item.service';
import { CatalogService } from './catalog.service';

@ApiTags('catalog')
@Controller('api/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService, private readonly itemService: ItemService) {}

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
}
