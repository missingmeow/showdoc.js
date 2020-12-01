import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { timeString } from 'src/utils/utils.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { AdminItemDto, AdminItemAttornDto } from './dto/admin.dto';
import { ItemService } from './item.service';

@ApiTags('adminItem')
@Controller('api/adminItem')
export class AdminItemController {
  constructor(private readonly itemService: ItemService, private readonly userService: UserService) {}

  @ApiOperation({ summary: '获取所有项目列表' })
  @UseGuards(JwtAuthGuard)
  @Post('getList')
  async getList(@Req() req, @Body() infoDto: AdminItemDto) {
    if (!req.user.admin) {
      return sendError(10103);
    }

    const result: any = await this.itemService.findItemList(
      parseInt(infoDto.page),
      parseInt(infoDto.count),
      infoDto.username,
      infoDto.item_name,
    );
    await Promise.all(
      result[0].map(async (value) => {
        value['addtime'] = timeString(value.addtime);
        value['member_num'] = await this.itemService.countItemMember(value.item_id);
      }),
    );
    return sendResult({ items: result[0], total: result[1] });
  }

  @ApiOperation({ summary: '转让项目' })
  @UseGuards(JwtAuthGuard)
  @Post('attorn')
  async attorn(@Req() req, @Body() attornDto: AdminItemAttornDto) {
    if (!req.user.admin) {
      return sendError(10103);
    }

    const user = await this.userService.findOne(attornDto.username);
    if (!user) {
      return sendError(10209);
    }

    const itemId = parseInt(attornDto.item_id);
    await this.itemService.attornItem(itemId, user.username, user.uid);
    const item = await this.itemService.findOneItem({ item_id: itemId, is_del: 0 });
    if (!item) {
      return sendError(10101);
    }
    return sendResult(item);
  }

  @ApiOperation({ summary: '删除项目' })
  @ApiBody({ schema: { example: { item_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('deleteItem')
  async deleteItem(@Req() req, @Body('item_id') itemId: number) {
    if (!req.user.admin) {
      return sendError(10103);
    }

    const result = await this.itemService.deleteItem(itemId);
    if (result.affected == 0) {
      return sendError(10101);
    }
    return sendResult(result.affected);
  }
}
