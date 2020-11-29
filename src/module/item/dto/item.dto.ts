import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';

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
