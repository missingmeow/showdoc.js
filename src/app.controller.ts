import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response) {
    res.setHeader('location', '/web#/');
    res.status(302).send();
  }

  @Post('server/index.php')
  phpIndex(@Req() req: Request, @Query('s') s, @Res() res: Response) {
    res.setHeader('location', s);
    res.status(302).send();
  }
}
