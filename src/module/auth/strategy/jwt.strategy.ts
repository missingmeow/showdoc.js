import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { jwtSecret } from 'src/utils/constants.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: function (request) {
        // ExtractJwt.fromAuthHeaderAsBearerToken()
        // 为了兼容showdoc的网页端，只能从 Cookie 获取了
        if (request.cookies['cookie_token']) {
          return request.cookies['cookie_token'];
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    return { uid: payload.sub, username: payload.username };
  }
}
