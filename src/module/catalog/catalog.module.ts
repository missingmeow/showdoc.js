import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { Catalog } from './entity/catalog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Catalog])],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
