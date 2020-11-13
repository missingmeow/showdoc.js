import { Controller, Get, Post, Query, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';
import { AuthService } from './module/auth/auth.service';
import { LocalAuthGuard } from './module/auth/guard/local-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly authService: AuthService) {}

  @ApiOperation({ summary: '首页' })
  @ApiResponse({ status: 302, description: '默认跳转到 /web 网页首页上' })
  @Get()
  @Redirect('web/#', 302)
  getHello() {
    return;
  }

  @ApiOperation({ summary: '原 PHP 的 API 入口' })
  @ApiResponse({ status: 302, description: '跳转到参数 s 所指定的 api 上' })
  @Post('server/index.php')
  @Redirect('', 302)
  phpIndex(@Query('s') url: string) {
    return { url };
  }

  @UseGuards(LocalAuthGuard)
  @Post('api/user/login')
  async login(@Req() req, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    res.setHeader('set-cookie', `jwt=${result.access_token}`);
    res.status(201).send(result);
  }
}
