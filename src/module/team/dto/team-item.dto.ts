import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class TeamItemSaveDto {
  @ApiProperty({ description: '项目 id' })
  @IsNumberString()
  item_id: string;

  @ApiProperty({ description: '团队 id，多个用 , 分割' })
  @IsNumberString()
  team_id: string;
}

export class TeamItemDeleteDto {
  @ApiProperty({ description: '项目团队 id' })
  @IsNumberString()
  id: string;
}
