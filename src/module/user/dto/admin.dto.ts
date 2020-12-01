import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class AdminUserDto {
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
}

export class AdminAddUserDto {
  @ApiProperty({ description: '用户名' })
  @IsOptional()
  @IsString()
  username: string;

  @ApiProperty({ description: '名称' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ description: '密码' })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({ description: '用户 id' })
  @IsOptional()
  @IsNumberString()
  uid: string;
}
