import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { sendResult } from 'src/utils/send.util';
import { CommonService } from './common.service';

@ApiTags('common')
@Controller('api/common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @ApiOperation({ summary: '获取首页配置信息' })
  @Post('homePageSetting')
  async homePageSetting() {
    const homePage = await this.commonService.findOneOption('home_page');
    const homeItem = await this.commonService.findOneOption('home_item');
    const data = {};
    data['home_page'] = homePage ? homePage.option_value : false;
    data['home_item'] = homeItem ? homeItem.option_value : false;
    return sendResult(data);
  }
}
