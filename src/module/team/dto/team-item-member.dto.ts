import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class TeamItemMemberListDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '团队 id' })
  @IsNumberString()
  team_id: string;
}

export class TeamItemMemberSaveDto {
  @ApiProperty({ description: '团队项目成员 id' })
  @IsNumberString()
  id: string;

  @ApiProperty({ description: '权限 id' })
  @IsOptional()
  @IsNumberString()
  member_group_id: string;

  @ApiProperty({ description: '目录 id' })
  @IsOptional()
  @IsNumberString()
  cat_id: string;
}
