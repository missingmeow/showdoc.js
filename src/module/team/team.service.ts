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

  /**
   * 查找 用户 id 关联的所有项目信息
   * @param uid 用户 id
   * @param itemId? 项目 id，可选
   * @param groupId? 组 id
   */
  async findItemMember(uid: number, itemId?: number, groupId?: number): Promise<TeamItemMember[]> {
    return this.teamItemMemberRepository.find({ member_uid: uid, item_id: itemId, member_group_id: groupId });
  }
}
