import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { sendResult } from 'src/utils/send.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { TeamService } from '../team/team.service';
import { ItemService } from './item.service';

@ApiTags('item')
@Controller('api/item')
export class ItemController {
  constructor(private readonly itemService: ItemService, private readonly teamItemService: TeamService) {}

  @ApiOperation({ summary: '我的项目列表' })
  @UseGuards(JwtAuthGuard)
  @Post('myList')
  async myList(@Req() req: Request) {
    const itemIds = [];
    const itemMember = await this.itemService.findItemMember(req['user']['uid']);
    itemMember.forEach((value) => itemIds.push(value.item_id));
    const teamItemMember = await this.teamItemService.findItemMember(req['user']['uid']);
    teamItemMember.forEach((value) => itemIds.push(value.item_id));

    const items = await this.itemService.findItem(req['user']['uid'], itemIds);
    items.forEach((value) => {
      //判断是否为自己的项目
      value['creator'] = value.uid === req['user']['uid'] ? 1 : 0;
      if (!value['creator']) delete value['password'];
      //判断是否为私密项目
      value['is_private'] = value['password'] ? 1 : 0;
    });
    // TODO: 读取需要置顶的项目
    // TODO: 读取项目顺序
    return sendResult(items);
  }
}
