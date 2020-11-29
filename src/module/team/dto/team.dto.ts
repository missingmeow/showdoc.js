import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TeamSaveDto {
  @ApiProperty({ description: '团队 id' })
  @IsOptional()
  @IsString()
  id: string;

  @ApiProperty({ description: '团队名称' })
  @IsString()
  team_name: string;
}
