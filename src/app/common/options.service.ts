import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Options } from './options.entity';

@Injectable()
export class OptionsService {
  constructor(
    @InjectRepository(Options)
    private readonly optionsRepository: Repository<Options>,
  ) {}

  async findAll(): Promise<Options[]> {
    return this.optionsRepository.find();
  }

  findOne(optionName: string): Promise<Options> {
    return this.optionsRepository.findOne({ option_name: optionName });
  }
}
