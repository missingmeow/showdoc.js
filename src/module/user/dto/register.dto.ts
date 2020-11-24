import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
// import { EqualsTo } from 'src/decorator/class-validator.decorator';

export class RegisterDto {
  @ApiProperty({ description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  password: string;

  @ApiProperty({ description: '确认密码' })
  // @EqualsTo('password', { message: '两次密码不一致' }) // 这个在控制器里判断了
  @IsString()
  confirm_password: string;

  @ApiProperty({ description: '验证码', required: false })
  @IsOptional()
  @IsString()
  v_code: string;
}
