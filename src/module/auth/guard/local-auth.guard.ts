import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginException } from 'src/filter/custom.exception';
import logger from 'src/utils/logger.util';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err: any, user: any, info: any, context: any, status?: any): any {
    if (err || !user) {
      if (status == 400) {
        throw new LoginException('用户名密码不能为空', 10206);
      }
      logger.error(`passport-local unexpect error: ${status} ${info}`);
      return super.handleRequest(err, user, info, context, status);
    }
    return user;
  }
}
