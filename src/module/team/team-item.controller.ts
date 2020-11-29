import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { now, timeString } from 'src/utils/utils.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ItemService } from '../item/item.service';
import { TeamItemSaveDto, TeamItemDeleteDto } from './dto/team-item.dto';
import { TeamService } from './team.service';

@ApiTags('team')
@Controller('api/teamItem')
export class TeamItemController {
  constructor(private readonly teamService: TeamService, private readonly itemService: ItemService) {}

  @ApiOperation({ summary: '根据项目来获取其绑定的团队列表' })
  @ApiBody({ schema: { example: { item_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('getList')
  async getList(@Req() req, @Body('item_id') itemId: number) {
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }
    const result = await this.teamService.findTeamItemByItemId(itemId);
    result.forEach((value) => {
      value.addtime = timeString(value.addtime);
    });
    return sendResult(result);
  }

  @ApiOperation({ summary: '添加和编辑' })
  @UseGuards(JwtAuthGuard)
  @Post('save')
  async save(@Req() req, @Body() teamItemDto: TeamItemSaveDto) {
    const teamId = parseInt(teamItemDto.team_id);
    const team = await this.teamService.findTeamById(teamId);
    if (!team || team.uid != req.user.uid) {
      return sendError(10209, '无此团队或者你无管理此团队的权限');
    }

    let teamItem: any;
    const itemArr = teamItemDto.item_id.split(',');
    await Promise.all(
      itemArr.map(async (value) => {
        const itemId = parseInt(value);
        if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
          return; // sendError(10303);
        }
        if (await this.teamService.findTeamItemByItemIdTeamId(teamId, itemId)) {
          return;
        }
        teamItem = await this.teamService.saveTeamItem({
          id: undefined,
          team_id: teamId,
          item_id: itemId,
          addtime: now(),
          last_update_time: undefined,
        });
        // 获取该团队的所有成员并加入项目
        const teamMem = await this.teamService.findTeamMemberByTeamId(teamId);
        teamMem.forEach(async (value) => {
          await this.teamService.saveTeamItemMember({
            team_id: teamId,
            item_id: itemId,
            member_uid: value.member_uid,
            member_username: value.member_username,
            member_group_id: 1, // 默认添加的权限为1，即编辑权限
            addtime: now(),
            last_update_time: undefined,
            id: undefined,
            cat_id: undefined,
          });
        });
        return;
      }),
    );
    if (!teamItem) {
      return sendError(10103, 'request fail');
    }
    return sendResult(teamItem);
  }

  @ApiOperation({ summary: '删除' })
  @UseGuards(JwtAuthGuard)
  @Post('delete')
  async delete(@Req() req, @Body() teamItemDto: TeamItemDeleteDto) {
    const teamItem = await this.teamService.findTeamItemById(parseInt(teamItemDto.id));
    if (!(await this.itemService.checkItemCreator(req.user.uid, teamItem.item_id))) {
      return sendError(10303);
    }
    await this.teamService.deleteTeamItemMember({ item_id: teamItem.item_id, team_id: teamItem.team_id });
    await this.teamService.deleteTeamItem(teamItem.id);
    return sendResult({});
  }
}
