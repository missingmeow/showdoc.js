import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string;

  @ApiProperty({ description: '验证码', required: false })
  @IsOptional()
  @IsString()
  v_code: string;
}
