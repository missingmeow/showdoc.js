import { Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
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
}
