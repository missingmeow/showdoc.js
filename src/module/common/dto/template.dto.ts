import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class TemplateSaveDto {
  @ApiProperty({ description: '模板标题' })
  @IsString()
  @MinLength(1)
  template_title: string;

  @ApiProperty({ description: '模板内容' })
  @IsString()
  @MinLength(1)
  template_content: string;
}
