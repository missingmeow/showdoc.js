import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemController } from './item.controller';
import { Item } from './entity/item.entity';
import { ItemService } from './item.service';
import { ItemMember } from './entity/item-member.entity';
import { ItemSort } from './entity/item-sort.entity';
import { ItemTop } from './entity/item-top.entity';
import { ItemToken } from './entity/item-token.entity';
import { ItemVariable } from './entity/item-variable.entity';
import { TeamModule } from '../team/team.module';
import { PageModule } from '../page/page.module';
import { CatalogModule } from '../catalog/catalog.module';
import { UserModule } from '../user/user.module';
import { AdminItemController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, ItemMember, ItemSort, ItemTop, ItemToken, ItemVariable]),
    forwardRef(() => TeamModule),
    forwardRef(() => PageModule),
    forwardRef(() => CatalogModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ItemController, AdminItemController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
