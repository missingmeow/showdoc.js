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
