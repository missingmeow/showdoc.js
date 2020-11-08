import { Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Redirect('web/#', 302)
  getHello() {
    return;
  }

  @Post('server/index.php')
  @Redirect('', 302)
  phpIndex(@Query('s') url: string) {
    return { url };
  }
}
