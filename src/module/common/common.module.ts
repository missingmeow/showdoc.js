import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Options } from './entity/options.entity';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';

@Module({
  imports: [TypeOrmModule.forFeature([Options])],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
