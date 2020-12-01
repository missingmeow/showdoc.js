import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/module/user/entity/user.entity';
import { CommonModule } from '../common/common.module';
import { ItemModule } from '../item/item.module';
import { TeamModule } from '../team/team.module';
import { AdminUserController } from './admin.controller';
import { UserToken } from './entity/user-token.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserToken]),
    forwardRef(() => CommonModule),
    forwardRef(() => ItemModule),
    forwardRef(() => TeamModule),
  ],
  providers: [UserService],
  controllers: [AdminUserController],
  exports: [UserService],
})
export class UserModule {}
