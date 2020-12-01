import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { sendError, sendResult } from 'src/utils/send.util';
import { timeString } from 'src/utils/utils.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CommonService } from '../common/common.service';
import { ItemService } from '../item/item.service';
import { TeamService } from '../team/team.service';
import { AdminAddUserDto, AdminUserDto } from './dto/admin.dto';
import { UserService } from './user.service';

@ApiTags('adminUser')
@Controller('api/adminUser')
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly itemService: ItemService,
    private readonly teamService: TeamService,
    private readonly commonService: CommonService,
  ) {}

  @ApiOperation({ summary: '获取所有用户列表' })
  @UseGuards(JwtAuthGuard)
  @Post('getList')
  async getList(@Req() req, @Body() infoDto: AdminUserDto) {
    if (!req.user.admin) {
      return sendError(10103);
    }

    const result: any = await this.userService.findUser(
      infoDto.username,
      parseInt(infoDto.page),
      parseInt(infoDto.count),
    );
    result[0].forEach((value) => {
      value.reg_time = timeString(value.reg_time);
      value.last_login_time = timeString(value.last_login_time);
    });
    return sendResult({ users: result[0], total: result[1] });
  }

  @ApiOperation({ summary: '新增用户' })
  @UseGuards(JwtAuthGuard)
  @Post('addUser')
  async addUser(@Req() req, @Body() addDto: AdminAddUserDto) {
    if (!req.user.admin) {
      return sendError(10103);
    }

    if (addDto.uid && addDto.uid != '0') {
      const uid = parseInt(addDto.uid);
      if (addDto.name) {
        await this.userService.updateUser(uid, { name: addDto.name });
      }
      if (addDto.password) {
        await this.userService.updateUser(uid, { password: addDto.password });
      }
    } else {
      if (await this.userService.findOne(addDto.username)) {
        return sendError(10101, '用户名已经存在啦！');
      }

      const user = await this.userService.register(addDto.username, addDto.password);
      if (!user) {
        return sendError(10101);
      }
      if (addDto.name) {
        await this.userService.updateUser(user.uid, { name: addDto.name });
      }
    }
    return sendResult({});
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiBody({ schema: { example: { uid: 'number' } } })
  @UseGuards(JwtAuthGuard)
  @Post('deleteUser')
  async deleteUser(@Req() req, @Body('uid') uid: number) {
    if (!req.user.admin) {
      return sendError(10103);
    }

    if (await this.itemService.findOneItem({ uid, is_del: 0 })) {
      return sendError(10101, '该用户名下还有项目，不允许删除。请先将其项目删除或者重新分配/转让');
    }

    await this.teamService.deleteTeamMember({ member_uid: uid });
    await this.teamService.deleteTeamItemMember({ member_uid: uid });
    await this.itemService.deleteItemMember({ uid });
    await this.itemService.deleteItemTop({ uid });
    await this.commonService.deleteTeamplate({ uid });
    await this.userService.deleteUserToken({ uid });
    await this.userService.deleteUser(uid);
    return sendResult({});
  }
}
