import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from '../catalog/catalog.module';
import { PageHistory } from './entity/page-history.entity';
import { PageLock } from './entity/page-lock.entity';
import { Page } from './entity/page.entity';
import { SinglePage } from './entity/single-page.entity';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { ItemModule } from '../item/item.module';
import { AttachmentModule } from '../attachment/attachment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, SinglePage, PageHistory, PageLock]),
    CatalogModule,
    forwardRef(() => ItemModule),
    AttachmentModule,
  ],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}
