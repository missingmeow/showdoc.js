import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { sendError } from 'src/utils/send.util';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserService } from './user.service';

@ApiTags('adminUser')
@Controller('api/adminUser')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('getList')
  async getList(@Req() req) {
    if (!req.user.admin) {
      return sendError(10103);
    }
  }
}
