import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';

export class MemberDeleteDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '成员 id' })
  @IsNumberString()
  item_member_id: string;
}

export class MemberSaveDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '目录 id' })
  @IsNumberString()
  cat_id: string;

  @ApiProperty({ description: '用户名，多个以 , 分割' })
  @IsString()
  username: string;

  @ApiProperty({ description: '组权限' })
  @IsNumberString()
  member_group_id: string;
}
