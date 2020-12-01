import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/module/user/entity/user.entity';
import { encryptPass, now } from 'src/utils/utils.util';
import { FindConditions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UserToken } from './entity/user-token.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
  ) {}

  async findOne(username: string): Promise<User> {
    return this.userRepository.findOne({ username });
  }

  async findOneById(uid: number): Promise<User> {
    return this.userRepository.findOne({ uid });
  }

  async findUser(username: string, page: number, count: number) {
    const builder = this.userRepository.createQueryBuilder();
    builder.offset((page - 1) * count);
    builder.limit(count);
    if (username) {
      builder.where('username like :user', { user: `%${username}%` });
    }
    return builder.getManyAndCount();
  }

  async updateUser(uid: number, partialEntity: QueryDeepPartialEntity<User>) {
    if (partialEntity.password) {
      partialEntity.password = encryptPass(partialEntity.password.toString());
    }
    return this.userRepository.update({ uid }, partialEntity);
  }

  async deleteUser(uid: number) {
    return this.userRepository.delete({ uid });
  }

  async checkPassword(uid: number, password: string) {
    const user = await this.findOneById(uid);
    if (!user) return false;
    if (user.password != encryptPass(password)) return false;
    return true;
  }

  async register(username: string, password: string) {
    const user = new User();
    user.username = username;
    user.password = encryptPass(password);
    user.reg_time = now();
    return this.userRepository.save(user);
  }

  /**
   * 设置用户的最后登录时间
   * @param uid 用户 id
   */
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

  async updateUserToken(uid: number) {
    this.userTokenRepository.update({ uid: uid }, { token_expire: 0 });
  }

  async deleteUserToken(criteria: FindConditions<UserToken>) {
    return this.userTokenRepository.delete(criteria);
  }

  async getAllUsername(username: string) {
    return this.userRepository
      .createQueryBuilder()
      .select('username', 'value')
      .where('username like :user', { user: `%${username ? username : ''}%` })
      .execute();
  }
}
