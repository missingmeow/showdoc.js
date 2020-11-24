import { Body, Controller, Get, Ip, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { jwtExpires } from 'src/utils/constants.util';
import { sendError, sendResult } from 'src/utils/send.util';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/guard/local-auth.guard';
import { CommonService } from '../common/common.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly commonService: CommonService,
  ) {}

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
      'Set-Cookie',
      `cookie_token=${result.access_token}; Expires=${new Date(Date.now() + jwtExpires * 1000)}; Path=/; HttpOnly`,
    );
    res.status(200).send(sendResult(user));
  }

  @ApiOperation({ summary: '登出' })
  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Req() req, @Res() res: Response) {
    await this.userService.updateUserToken(req.user.uid);
    res.setHeader('Set-Cookie', 'cookie_token=deleted; Expires=0; Path=/; HttpOnly');
    res.status(200).send(sendResult({}));
  }

  @ApiOperation({ summary: '获取个人信息' })
  @UseGuards(JwtAuthGuard)
  @Post('info')
  async info(@Req() req: Request, @Res() res: Response) {
    const user = await this.userService.findOne(req.user['username']);
    if (!user) {
      res.setHeader('Set-Cookie', 'cookie_token=deleted; Expires=0; Path=/; HttpOnly');
      res.send(sendError(10102));
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, cookie_token, cookie_token_expire, reg_time, last_login_time, ...result } = user;
    res.send(sendResult(result));
  }

  @ApiOperation({ summary: '注册' })
  @Post('register')
  async register(@Body() regDto: RegisterDto, @Ip() ip: string, @Res() res: Response) {
    const option = await this.commonService.findOneOption('register_open');
    if (option && option.option_value == '0') {
      return res.send(sendError(10101, '管理员已关闭注册'));
    }

    if (regDto.password != regDto.confirm_password) {
      return res.send(sendError(10101, '两次输入的密码不一致！'));
    }

    const user = await this.userService.findOne(regDto.username);
    if (user) {
      return res.send(sendError(10101, '用户名已经存在啦！'));
    }

    const register = await this.userService.register(regDto.username, regDto.password);
    if (!register) {
      return res.send(sendError(10101, '注册失败，请稍后再试'));
    }

    // 获取 token
    const result = await this.authService.login(register);
    register['user_token'] = result.access_token;

    // token 写入数据库
    await this.userService.insertUserToken(register.uid, result.access_token, jwtExpires, ip);
    // TODO: cookie 过期记录使用定期任务来做

    res.setHeader(
      'Set-Cookie',
      `cookie_token=${result.access_token}; Expires=${new Date(Date.now() + jwtExpires * 1000)}; Path=/; HttpOnly`,
    );
    res.send(
      sendResult({
        uid: register.uid,
        username: register.username,
        name: register.name,
        groupid: register.groupid,
        avatar: register.avatar,
        avatar_small: register.avatar_small,
        email: register.email,
        email_verify: undefined, // ?
        user_token: result.access_token,
      }),
    );
  }
}
