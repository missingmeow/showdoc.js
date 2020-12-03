import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNumberString } from 'class-validator';

export class PageSortDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '页面排序数据，Json 字符串格式' })
  @IsJSON()
  pages: string;
}
