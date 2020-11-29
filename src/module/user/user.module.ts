import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/module/user/entity/user.entity';
import { CommonModule } from '../common/common.module';
import { AdminUserController } from './admin.controller';
import { UserToken } from './entity/user-token.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserToken]), forwardRef(() => CommonModule)],
  providers: [UserService],
  controllers: [AdminUserController],
  exports: [UserService],
})
export class UserModule {}
