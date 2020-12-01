import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class AdminItemDto {
  @ApiProperty({ description: '第几页' })
  @IsNumberString()
  page: string;

  @ApiProperty({ description: '条数' })
  @IsNumberString()
  count: string;

  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  username: string;

  @ApiProperty({ description: '项目名称', required: false })
  @IsOptional()
  @IsString()
  item_name: string;
}

export class AdminItemAttornDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string;
}
