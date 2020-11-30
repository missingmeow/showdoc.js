import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { timeString } from 'src/utils/utils.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CatalogService } from '../catalog/catalog.service';
import { ItemService } from '../item/item.service';
import { TeamItemMemberListDto, TeamItemMemberSaveDto } from './dto/team-item-member.dto';
import { TeamService } from './team.service';

@ApiTags('team')
@Controller('api/teamItemMember')
export class TeamItemMemberController {
  constructor(
    private readonly teamService: TeamService,
    private readonly itemService: ItemService,
    private readonly catalogService: CatalogService,
  ) {}

  @ApiOperation({ summary: '获取列表' })
  @UseGuards(JwtAuthGuard)
  @Post('getList')
  async getList(@Req() req, @Body() teamItemMemDto: TeamItemMemberListDto) {
    const itemId = parseInt(teamItemMemDto.item_id);
    const teamId = parseInt(teamItemMemDto.team_id);
    if (!(await this.itemService.checkItemCreator(req.user.uid, itemId))) {
      return sendError(10303);
    }
    const result: any = await this.teamService.findTeamItemMember({ item_id: itemId, team_id: teamId });
    await Promise.all(
      result.map(async (value) => {
        value.addtime = timeString(value.addtime);
        value.cat_name = '所有目录';
        if (value.cat_id > 0) {
          const cat = await this.catalogService.findCatalogById(value.cat_id);
          if (cat && cat.cat_name) {
            value.cat_name = cat.cat_name;
          }
        } else {
          value.cat_id = value.cat_id.toString();
        }
        value.member_group_id = value.member_group_id.toString();
      }),
    );
    return sendResult(result);
  }

  @ApiOperation({ summary: '编辑' })
  @UseGuards(JwtAuthGuard)
  @Post('save')
  async save(@Req() req, @Body() teamItemDto: TeamItemMemberSaveDto) {
    const teamItemMemId = parseInt(teamItemDto.id);
    const teamItemMem = await this.teamService.findOneTeamItemMember({ id: teamItemMemId });
    if (!(await this.itemService.checkItemCreator(req.user.uid, teamItemMem.item_id))) {
      return sendError(10303);
    }
    const team = await this.teamService.findTeamById(teamItemMem.team_id);
    if (!team || team.uid != req.user.uid) {
      return sendError(10209, '无此团队或者你无管理此团队的权限');
    }
    if (teamItemDto.cat_id) {
      await this.teamService.updateTeamItemMember(teamItemMemId, { cat_id: parseInt(teamItemDto.cat_id) });
    }
    if (teamItemDto.member_group_id) {
      await this.teamService.updateTeamItemMember(teamItemMemId, {
        member_group_id: parseInt(teamItemDto.member_group_id),
      });
    }
    return sendResult({});
  }
}
