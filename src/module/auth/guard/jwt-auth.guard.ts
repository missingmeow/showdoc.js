import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NoAuthException } from 'src/filter/custom.exception';

/**
 * Jwt 验证，验证失败直接返回
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

/**
 * Jwt 解析验证但结果不会对影响后续的控制器执行，可以通过 req.user 判断用户是否已登录用户
 */
@Injectable()
export class JwtNoAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, info: any, context: any, status?: any): any {
    if (err || !user) {
      return null;
    }
    return user;
  }
}

@Injectable()
export class JwtAdminGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any, status?: any): any {
    if (err || !user) {
      return super.handleRequest(err, user, info, context, status);
    }
    if (!user.admin) {
      throw new NoAuthException('权限不够', 10103);
    }
    return user;
  }
}
