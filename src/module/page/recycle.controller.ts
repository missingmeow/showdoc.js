import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { timeString } from 'src/utils/utils.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ItemService } from '../item/item.service';
import { RecycleDto } from './dto/recycle.dto';
import { PageService } from './page.service';

@ApiTags('page')
@Controller('api/recycle')
export class RecycleController {
  constructor(private readonly pageService: PageService, private readonly itemService: ItemService) {}

  @ApiOperation({ summary: '获取被删除的页面列表' })
  @ApiBody({ schema: { example: { item_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('getList')
  async recycleGetList(@Req() req, @Body('item_id') itemId: number) {
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }
    const list = await this.pageService.findRecyleList(itemId);
    list.forEach((value) => {
      value['del_time'] = timeString(value.del_time);
    });
    return sendResult(list);
  }

  @ApiOperation({ summary: '恢复页面' })
  @UseGuards(JwtAuthGuard)
  @Post('recover')
  async recover(@Req() req, @Body() recDto: RecycleDto) {
    if (!(await this.itemService.checkItemCreator(req.user.uid, parseInt(recDto.item_id)))) {
      return sendError(10303);
    }

    await this.pageService.recoverPage(parseInt(recDto.page_id));
    await this.pageService.deleteRecycle(parseInt(recDto.item_id), parseInt(recDto.page_id));
    return sendResult({});
  }
}
