import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Options } from './options.entity';
import { CommonController } from './common.controller';
import { OptionsService } from './options.service';

@Module({
  imports: [TypeOrmModule.forFeature([Options])],
  providers: [OptionsService],
  controllers: [CommonController],
})
export class CommonModule {}
