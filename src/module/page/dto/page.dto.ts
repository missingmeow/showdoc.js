import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNumberString, IsOptional, IsString } from 'class-validator';

export class PageSaveDto {
  @ApiProperty({ description: '页面 id' })
  @IsNumberString()
  page_id: string;

  @ApiProperty({ description: '是否URL转码' })
  @IsOptional()
  @IsNumberString()
  is_urlencode: string;

  @ApiProperty({ description: '页面标题' })
  @IsString()
  page_title: string;

  @ApiProperty({ description: '页面内容' })
  @IsString()
  page_content: string;

  @ApiProperty({ description: '页面评论' })
  @IsOptional()
  @IsString()
  page_comments: string;

  @ApiProperty({ description: '目录 id' })
  @IsNumberString()
  cat_id: string;

  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '项目 id' })
  @IsOptional()
  @IsNumberString()
  s_number: string;
}

export class PageSortDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '页面排序数据，Json 字符串格式' })
  @IsJSON()
  pages: string;
}

export class PageLockDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '页面 id' })
  @IsNumberString()
  page_id: string;

  @ApiProperty({ description: '锁定时间' })
  @IsOptional()
  @IsNumberString()
  lock_to: string;
}

export class PageDiffDto {
  @ApiProperty({ description: '页面 id' })
  @IsNumberString()
  page_id: string;

  @ApiProperty({ description: '页面历史记录 id' })
  @IsNumberString()
  page_history_id: string;
}
