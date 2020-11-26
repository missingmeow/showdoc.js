import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class ItemAddDto {
  @ApiProperty({ description: '项目名称' })
  @IsString()
  @Length(1)
  item_name: string;

  @ApiProperty({ description: '自定义域名' })
  @IsOptional()
  @IsString()
  item_domain: string;

  @ApiProperty({ description: '复制项目 id' })
  @IsOptional()
  @IsString()
  copy_item_id: string;

  @ApiProperty({ description: '私密项目访问密码' })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({ description: '项目描述' })
  @IsOptional()
  @IsString()
  item_description: string;

  @ApiProperty({ description: '项目类型' })
  @IsOptional()
  @IsString()
  @IsIn(['1', '2', '4'])
  item_type: string;
}
