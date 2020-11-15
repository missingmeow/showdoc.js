import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/guard/local-auth.guard';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @ApiOperation({ summary: '登录' })
  @ApiBody({})
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    res.setHeader('set-cookie', `jwt=${result.access_token}`);
    res.status(201).send(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('info')
  info(@Req() req: Request) {
    return this.userService.findOne(req.user['username']);
  }
}
