import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { encryptPass } from 'src/utils/utils.util';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === encryptPass(pass)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, cookie_token, cookie_token_expire, reg_time, last_login_time, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.uid, admin: user.groupid == 1 };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
