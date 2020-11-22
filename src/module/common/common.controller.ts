import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { sendResult } from 'src/utils/send.util';
import { OptionsService } from './options.service';

@ApiTags('common')
@Controller('api/common')
export class CommonController {
  constructor(private readonly optionsService: OptionsService) {}

  @ApiOperation({ summary: '获取首页配置信息' })
  @Post('homePageSetting')
  async homePageSetting() {
    const homePage = await this.optionsService.findOne('home_page');
    const homeItem = await this.optionsService.findOne('home_item');
    const data = {};
    data['home_page'] = homePage ? homePage.option_value : false;
    data['home_item'] = homeItem ? homeItem.option_value : false;
    return sendResult(data);
  }
}
