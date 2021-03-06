import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindConditions, FindManyOptions, Repository } from 'typeorm';
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

  async findOneOption(optionName: string): Promise<Options> {
    return this.optionsRepository.findOne({ option_name: optionName });
  }

  async updateOption(optionName: string, optionValue: string) {
    return this.optionsRepository.query('replace into options (option_name, option_value) values (?, ?)', [
      optionName,
      optionValue,
    ]);
  }

  async findTeamplate(options: FindManyOptions<Template>) {
    return this.templateRepository.find(options);
  }

  async saveTemplate(entities: DeepPartial<Template>) {
    return this.templateRepository.save(entities);
  }

  async deleteTeamplate(criteria: FindConditions<Template>) {
    return this.templateRepository.delete(criteria);
  }
}
