import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { now } from 'src/utils/utils.util';
import { UserToken } from './user-token.entity';

@Injectable()
export class UserTokenService {
  constructor(
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
  ) {}

  async insert(uid: number, token: string, expire: number, ip: string): Promise<any> {
    const user = this.userTokenRepository.create();
    user.uid = uid;
    user.token = token;
    user.token_expire = now() + expire;
    user.addtime = now();
    user.ip = ip;
    return this.userTokenRepository.insert(user);
  }

  async findAll(): Promise<UserToken[]> {
    return this.userTokenRepository.find();
  }
}
