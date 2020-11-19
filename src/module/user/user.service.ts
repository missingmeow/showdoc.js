import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/module/user/entity/user.entity';
import { now } from 'src/utils/utils.util';
import { Repository } from 'typeorm';
import { UserToken } from './entity/user-token.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(username: string): Promise<User> {
    return this.userRepository.findOne({ username });
  }

  async setLastTime(uid: number) {
    this.userRepository.update({ uid }, { last_login_time: now() });
  }

  async insertUserToken(uid: number, token: string, expire: number, ip: string): Promise<any> {
    const user = new UserToken();
    user.uid = uid;
    user.token = token;
    user.token_expire = now() + expire;
    user.addtime = now();
    user.ip = ip;
    return this.userTokenRepository.save(user);
  }
}
