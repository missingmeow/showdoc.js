import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { now, timeString } from 'src/utils/utils.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ItemService } from '../item/item.service';
import { UserService } from '../user/user.service';
import { TeamMemberDeleteDto, TeamMemberSaveDto } from './dto/team-member.dto';
import { TeamService } from './team.service';

@ApiTags('team')
@Controller('api/teamMember')
export class TeamMemberController {
  constructor(
    private readonly teamService: TeamService,
    private readonly itemService: ItemService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: '获取列表' })
  @ApiBody({ schema: { example: { team_id: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('getList')
  async getList(@Req() req, @Body('team_id') teamId: number) {
    const team = await this.teamService.findTeamById(teamId);
    if (!team || team.uid != req.user.uid) {
      return sendError(10209, '无此团队或者你无管理此团队的权限');
    }
    const result = await this.teamService.findTeamMemberByTeamId(teamId);
    result.forEach((value) => {
      value.addtime = timeString(value.addtime);
    });
    return sendResult(result);
  }

  @ApiOperation({ summary: '添加和编辑' })
  @UseGuards(JwtAuthGuard)
  @Post('save')
  async save(@Req() req, @Body() teamMemberDto: TeamMemberSaveDto) {
    const teamId = parseInt(teamMemberDto.team_id);
    const team = await this.teamService.findTeamById(teamId);
    if (!team || team.uid != req.user.uid) {
      return sendError(10209, '无此团队或者你无管理此团队的权限');
    }

    let teamMember: any;
    const userArr = teamMemberDto.member_username.split(',');
    await Promise.all(
      userArr.map(async (value) => {
        const user = await this.userService.findOne(value);
        if (!user) {
          return;
        }
        if (await this.teamService.findTeamMemberByIdAndUid(teamId, user.uid)) {
          return;
        }
        teamMember = await this.teamService.saveTeamMember({
          id: undefined,
          team_id: teamId,
          member_uid: user.uid,
          member_username: user.username,
          addtime: now(),
          last_update_time: undefined,
        });
        //检查该团队已经加入了哪些项目
        const teamItem = await this.teamService.findTeamItem({ team_id: teamId });
        teamItem.forEach(async (value) => {
          await this.teamService.saveTeamItemMember({
            team_id: teamId,
            item_id: value.item_id,
            member_uid: user.uid,
            member_username: user.username,
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
    if (!teamMember) {
      return sendError(10103, 'request fail');
    }
    return sendResult(teamMember);
  }

  @ApiOperation({ summary: '删除' })
  @UseGuards(JwtAuthGuard)
  @Post('delete')
  async delete(@Req() req, @Body() teamItemDto: TeamMemberDeleteDto) {
    const teamMember = await this.teamService.findTeamMemberById(parseInt(teamItemDto.id));
    const team = await this.teamService.findTeamById(teamMember.team_id);
    if (!team || team.uid != req.user.uid) {
      return sendError(10209, '无此团队或者你无管理此团队的权限');
    }
    await this.teamService.deleteTeamItemMember({ member_uid: teamMember.member_uid, team_id: teamMember.team_id });
    await this.teamService.deleteTeamMember({ id: teamMember.id });
    return sendResult({});
  }
}
