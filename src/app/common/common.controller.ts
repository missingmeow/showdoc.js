import { Controller, Get } from '@nestjs/common';
import { sendResult } from 'src/utils/send.util';
import { OptionsService } from './options.service';

@Controller('api/common')
export class CommonController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get('homePageSetting')
  async findOne() {
    const homePage = await this.optionsService.findOne('home_page');
    const homeItem = await this.optionsService.findOne('home_item');
    const data = {};
    data['home_page'] = homePage ? homePage.option_value : false;
    data['home_item'] = homeItem ? homeItem.option_value : false;
    return sendResult(data);
  }
}
