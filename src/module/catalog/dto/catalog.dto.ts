import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, MinLength } from 'class-validator';

export class CatalogSaveDto {
  @ApiProperty({ description: '目录名称' })
  @IsString()
  @MinLength(1)
  cat_name: string;

  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '目录 id' })
  @IsString()
  cat_id: string;

  @ApiProperty({ description: '父目录 id' })
  @IsString()
  parent_cat_id: string;

  @ApiProperty({ description: '' })
  @IsOptional()
  @IsString()
  s_number: string;
}

export class CatalogPageDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '目录 id' })
  @IsNumberString()
  cat_id: string;
}

export class CatalogDefaultDto {
  @ApiProperty({ description: '页面 id' })
  @IsOptional()
  @IsString()
  page_id: string;

  @ApiProperty({ description: '项目 id' })
  @IsOptional()
  @IsString()
  item_id: string;

  @ApiProperty({ description: '复制页面 id' })
  @IsOptional()
  @IsString()
  copy_page_id: string;

  @ApiProperty({ description: '历史页面 id' })
  @IsOptional()
  @IsString()
  page_history_id: string;
}
