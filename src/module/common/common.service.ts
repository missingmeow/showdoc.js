import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Options } from './entity/options.entity';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(Options)
    private readonly optionsRepository: Repository<Options>,
  ) {}

  async findAllOption(): Promise<Options[]> {
    return this.optionsRepository.find();
  }

  findOneOption(optionName: string): Promise<Options> {
    return this.optionsRepository.findOne({ option_name: optionName });
  }
}
