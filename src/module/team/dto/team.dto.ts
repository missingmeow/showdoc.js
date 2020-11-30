import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class TeamSaveDto {
  @ApiProperty({ description: '团队 id' })
  @IsOptional()
  @IsString()
  id: string;

  @ApiProperty({ description: '团队名称' })
  @IsString()
  team_name: string;
}

export class TeamAttornDto {
  @ApiProperty({ description: '团队 id' })
  @IsNumberString()
  team_id: string;

  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string;

  @ApiProperty({ description: '确认密码' })
  @IsString()
  password: string;
}
