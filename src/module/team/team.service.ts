import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamItemMember } from './entity/team-item-member.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamItemMember)
    private readonly teamItemMemberRepository: Repository<TeamItemMember>,
  ) {}

  async findItemMember(uid: number): Promise<TeamItemMember[]> {
    return this.teamItemMemberRepository.find({ member_uid: uid });
  }
}
