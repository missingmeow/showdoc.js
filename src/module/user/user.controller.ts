import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { jwtExpires } from 'src/utils/constants.util';
import { sendResult } from 'src/utils/send.util';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/guard/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @ApiOperation({ summary: '登录' })
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res() res: Response) {
    const user = req.user;
    // TODO: 如果 Item 里面没有数据，则默认导入系统的

    // 写入最后登录时间
    await this.userService.setLastTime(user.uid);

    // 获取 token
    const result = await this.authService.login(user);
    user['user_token'] = result.access_token;

    // token 写入数据库
    await this.userService.insertUserToken(user.uid, result.access_token, jwtExpires, req.ip);
    // TODO: cookie 过期记录使用定期任务来做

    res.setHeader(
      'set-cookie',
      `jwt=${result.access_token}; Expires=${new Date(Date.now() + jwtExpires * 1000)}; Path=/; HttpOnly`,
    );
    res.status(200).send(sendResult(user));
  }

  @ApiOperation({ summary: '获取个人信息' })
  @UseGuards(JwtAuthGuard)
  @Post('info')
  async info(@Req() req: Request, @Res() res: Response) {
    const user = await this.userService.findOne(req.user['username']);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, cookie_token, cookie_token_expire, reg_time, last_login_time, ...result } = user;
    res.status(200).send(sendResult(result));
  }
}
