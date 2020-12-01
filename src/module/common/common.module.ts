import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Options } from './entity/options.entity';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { ItemModule } from '../item/item.module';
import { CatalogModule } from '../catalog/catalog.module';
import { UserModule } from '../user/user.module';
import { Template } from './entity/template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Options, Template]),
    forwardRef(() => ItemModule),
    forwardRef(() => CatalogModule),
    forwardRef(() => UserModule),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
