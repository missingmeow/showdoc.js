import { Controller, Get, Post, Redirect } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  @ApiOperation({ summary: '首页' })
  @ApiResponse({ status: 302, description: '默认跳转到 /web 网页首页上' })
  @Get()
  @Redirect('web/#', 302)
  getHello() {
    return;
  }

  @ApiOperation({ summary: '原 PHP 接口入口函数，会直接转发到 s 参数对应的路由上' })
  @ApiResponse({ status: 200, description: '路由 s 返回数据' })
  @ApiQuery({ name: 's', description: '真正的路由路径' })
  @Post('server/index.php')
  rediect() {
    return;
  }

  @ApiOperation({ summary: 'TODO' })
  @Get('/api/ScriptCron/run')
  scriptCron() {
    return;
  }

  @ApiOperation({ summary: 'TODO' })
  @Get('/api/update/checkDb')
  updateCheckDb() {
    return;
  }

  @ApiOperation({ summary: 'TODO' })
  @Post('api/adminUser/checkUpdate')
  checkUpdate() {
    return;
  }
}
