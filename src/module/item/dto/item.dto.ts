import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, MinLength } from 'class-validator';

export class ItemDeleteDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string;
}

export class ItemAttornDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string;

  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string;
}

export class ItemUpdateDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '项目名称' })
  @IsString()
  @MinLength(1)
  item_name: string;

  @ApiProperty({ description: '自定义域名' })
  @IsOptional()
  @IsString()
  item_domain: string;

  @ApiProperty({ description: '私密项目访问密码' })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({ description: '项目描述' })
  @IsOptional()
  @IsString()
  item_description: string;
}

export class ItemPwdDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '私密项目访问密码' })
  @IsString()
  password: string;

  @ApiProperty({ description: '跳转url', required: false })
  @IsOptional()
  @IsString()
  refer_url: string;
}
