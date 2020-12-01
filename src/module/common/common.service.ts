import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import { Options } from './entity/options.entity';
import { Template } from './entity/template.entity';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(Options)
    private readonly optionsRepository: Repository<Options>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async findAllOption(): Promise<Options[]> {
    return this.optionsRepository.find();
  }

  async findOneOption(optionName: string): Promise<Options> {
    return this.optionsRepository.findOne({ option_name: optionName });
  }

  async deleteTeamplate(criteria: FindConditions<Template>) {
    return this.templateRepository.delete(criteria);
  }
}
