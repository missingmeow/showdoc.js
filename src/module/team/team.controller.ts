import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { now, timeString } from 'src/utils/utils.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ItemService } from '../item/item.service';
import { TeamSaveDto } from './dto/team.dto';
import { TeamService } from './team.service';

@ApiTags('team')
@Controller('api/team')
export class TeamController {
  constructor(private readonly teamService: TeamService, private readonly itemService: ItemService) {}

  @ApiOperation({ summary: '获取团队信息' })
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
      await this.teamService.updateTeam(parseInt(teamDto.id), teamDto.team_name);
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
}
