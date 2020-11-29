import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';

export class TeamMemberSaveDto {
  @ApiProperty({ description: '团队 id' })
  @IsNumberString()
  team_id: string;

  @ApiProperty({ description: '团队成员，多个用 , 分割' })
  @IsString()
  member_username: string;
}

export class TeamMemberDeleteDto {
  @ApiProperty({ description: '项目团队 id' })
  @IsNumberString()
  id: string;
}
