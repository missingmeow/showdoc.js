import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const realPass = createHash('md5')
      .update(Buffer.from(createHash('md5').update(pass).digest('hex')).toString('base64') + '576hbgh6')
      .digest('hex');

    const user = await this.usersService.findOne(username);

    if (user && user.password === realPass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.uid };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
