import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { Catalog } from './entity/catalog.entity';
import { CatalogController } from './catalog.controller';
import { ItemModule } from '../item/item.module';
import { PageModule } from '../page/page.module';

@Module({
  imports: [TypeOrmModule.forFeature([Catalog]), forwardRef(() => ItemModule), forwardRef(() => PageModule)],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
