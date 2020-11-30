import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { now, timeString } from 'src/utils/utils.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ItemService } from '../item/item.service';
import { UserService } from '../user/user.service';
import { TeamAttornDto, TeamSaveDto } from './dto/team.dto';
import { TeamService } from './team.service';

@ApiTags('team')
@Controller('api/team')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly userService: UserService,
    private readonly itemService: ItemService,
  ) {}

  @ApiOperation({ summary: '获取团队列表' })
  @UseGuards(JwtAuthGuard)
  @Post('getList')
  async getList(@Req() req) {
    const result: any[] = await this.teamService.findTeamByUserId(req.user.uid);
    await Promise.all(
      result.map(async (value) => {
        //获取该团队成员数
        value['memberCount'] = await this.teamService.teamMemberCount(value.id);
        //获取该团队涉及项目数
        value['itemCount'] = await this.teamService.teamItemCount(value.id);
        value['addtime'] = timeString(value.addtime);
      }),
    );
    return sendResult(result);
  }

  @ApiOperation({ summary: '添加和编辑' })
  @UseGuards(JwtAuthGuard)
  @Post('save')
  async save(@Req() req, @Body() teamDto: TeamSaveDto) {
    let team: any;
    if (teamDto.id) {
      await this.teamService.updateTeam(parseInt(teamDto.id), { team_name: teamDto.team_name });
      team = await this.teamService.findTeamById(parseInt(teamDto.id));
    } else {
      team = await this.teamService.saveTeam({
        id: undefined,
        uid: req.user.uid,
        username: req.user.username,
        team_name: teamDto.team_name,
        addtime: now(),
        last_update_time: undefined,
      });
    }
    if (!team) {
      return sendError(10103, 'request fail');
    }
    return sendResult(team);
  }

  @ApiOperation({ summary: '转让团队' })
  @UseGuards(JwtAuthGuard)
  @Post('attorn')
  async attorn(@Req() req, @Body() teamDto: TeamAttornDto) {
    const teamId = parseInt(teamDto.team_id);
    const team = await this.teamService.findTeamById(teamId);
    if (!team || team.uid != req.user.uid) {
      return sendError(10209, '无此团队或者你无管理此团队的权限');
    }
    if (await this.userService.checkPassword(req.user.uid, teamDto.password)) {
      return sendError(10208);
    }
    const user = await this.userService.findOne(teamDto.username);
    if (!user) {
      return sendError(10209);
    }
    await this.teamService.updateTeam(teamId, { uid: user.uid, username: user.username });
    const result = await this.teamService.findTeamItem({ team_id: teamId });
    await Promise.all(
      result.map(async (value) => {
        await this.itemService.updateItem(value.item_id, { uid: user.uid, username: user.username });
      }),
    );
    return sendResult({});
  }

  @ApiOperation({ summary: '删除' })
  @ApiBody({ schema: { description: '团队 id', example: { id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('delete')
  async delete(@Req() req, @Body('id') teamId: number) {
    const team = await this.teamService.findTeamById(teamId);
    if (!team || team.uid != req.user.uid) {
      return sendError(10209, '无此团队或者你无管理此团队的权限');
    }
    await this.teamService.deleteTeam(teamId);
    return sendResult({});
  }
}
