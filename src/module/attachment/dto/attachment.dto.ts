import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class UploadListDto {
  @ApiProperty({ description: '页面 id' })
  @IsOptional()
  @IsNumberString()
  page_id: string;

  @ApiProperty({ description: '项目 id' })
  @IsOptional()
  @IsNumberString()
  item_id: string;
}

export class UploadMyListDto {
  @ApiProperty({ description: '第几页' })
  @IsNumberString()
  page: string;

  @ApiProperty({ description: '条数' })
  @IsNumberString()
  count: string;

  @ApiProperty({ description: '附件类型' })
  @IsOptional()
  @IsNumberString()
  attachment_type: string;

  @ApiProperty({ description: '附件名称' })
  @IsOptional()
  @IsString()
  display_name: string;

  @ApiProperty({ description: '用户名' })
  @IsOptional()
  @IsString()
  username: string;
}
