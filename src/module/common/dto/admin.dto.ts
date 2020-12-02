import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumberString, IsOptional, IsString, ValidateNested } from 'class-validator';

class LdapformDto {
  @IsString()
  host: string;
  @IsString()
  port: string;
  @IsString()
  base_dn: string;
  @IsString()
  bind_dn: string;
  @IsString()
  bind_password: string;
  @IsString()
  version: string;
  @IsString()
  user_field: string;
}

class OssSettingDto {
  @IsString()
  oss_type: string;
  @IsString()
  key: string;
  @IsString()
  secret: string;
  @IsString()
  endpoint: string;
  @IsString()
  bucket: string;
  @IsString()
  domain: string;
}

export class AdminSaveConfigDto {
  @ApiProperty({ description: '是否开放注册' })
  @IsBoolean()
  register_open: boolean;

  @ApiProperty({ description: '首页设置' })
  @IsNumberString()
  home_page: string;

  @ApiProperty({ description: '首页项目 id' })
  home_item: string | number;

  @ApiProperty({ description: '是否启用 ldap 登录' })
  @IsBoolean()
  ldap_open: boolean;

  @ApiProperty({ description: 'ldap 设置' })
  @IsOptional()
  @ValidateNested()
  ldap_form: LdapformDto;

  @ApiProperty({ description: '是否启用云存储设置' })
  @IsBoolean()
  oss_open: boolean;

  @ApiProperty({ description: 'oss 设置' })
  @IsOptional()
  @ValidateNested()
  oss_setting: OssSettingDto;
}
