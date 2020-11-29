import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class RecycleDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '页面 id' })
  @IsNumberString()
  page_id: string;
}
