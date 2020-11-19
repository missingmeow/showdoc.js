import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/module/user/entity/user.entity';
import { UserToken } from './entity/user-token.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserToken])],
  providers: [UserService],
  // controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
