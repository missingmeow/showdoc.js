import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/module/user/user.entity';
import { UserToken } from './user-token.entity';
import { UserTokenService } from './user-token.service';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserToken])],
  providers: [UserService, UserTokenService],
  // controllers: [UserController],
  exports: [UserService, UserTokenService],
})
export class UserModule {}
