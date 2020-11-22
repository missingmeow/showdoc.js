import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ItemInfoDto {
  @ApiProperty({ description: '项目 id 或 项目域名' })
  @IsNotEmpty()
  item_id: number | string;

  @ApiProperty({ description: '项目个性域名' })
  @IsOptional()
  @IsString()
  item_domain: string;

  @ApiProperty({ description: '关键字' })
  @IsOptional()
  @IsString()
  keyword: string;

  @ApiProperty({ description: '项目中默认显示的页面' })
  @IsOptional()
  default_page_id: number | string;

  @ApiProperty({ description: '当前页面 id' })
  @IsOptional()
  page_id: number | string;
}
