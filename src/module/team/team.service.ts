import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User } from '../user/entity/user.entity';
import { TeamItemMember } from './entity/team-item-member.entity';
import { TeamItem } from './entity/team-item.entity';
import { TeamMember } from './entity/team-member.entiry';
import { Team } from './entity/team.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(TeamItem)
    private readonly teamItemRepository: Repository<TeamItem>,
    @InjectRepository(TeamItemMember)
    private readonly teamItemMemberRepository: Repository<TeamItemMember>,
  ) {}

  async findTeamByUserId(uid: number) {
    return this.teamRepository.createQueryBuilder().where('uid=:uid', { uid }).orderBy('addtime', 'ASC').getMany();
  }

  async findTeamById(teamId: number) {
    return this.teamRepository.findOne({ id: teamId });
  }

  async updateTeam(teamId: number, partialEntity: QueryDeepPartialEntity<Team>) {
    return this.teamRepository.update({ id: teamId }, partialEntity);
  }

  async saveTeam(team: Team) {
    return this.teamRepository.save(team);
  }

  async deleteTeam(teamId: number) {
    await this.teamRepository.delete({ id: teamId });
    await this.teamItemRepository.delete({ team_id: teamId });
    await this.teamMemberRepository.delete({ team_id: teamId });
    await this.teamItemMemberRepository.delete({ team_id: teamId });
    return;
  }

  async teamMemberCount(teamId: number) {
    return this.teamMemberRepository.count({ team_id: teamId });
  }

  async teamItemCount(teamId: number) {
    return this.teamItemRepository.count({ team_id: teamId });
  }

  async findTeamItemById(teamItemId: number) {
    return this.teamItemRepository.findOne({ id: teamItemId });
  }

  async findTeamItem(conditions: FindConditions<TeamItem>) {
    return this.teamItemRepository.find(conditions);
  }

  async findTeamItemByItemId(itemId: number) {
    return this.teamRepository
      .createQueryBuilder('team')
      .select('team.*, team_item.team_id, team_item.id as id')
      .leftJoin(TeamItem, 'team_item', 'team.id = team_item.team_id')
      .where('team_item.item_id=:itemId', { itemId })
      .execute();
  }

  async saveTeamItem(teamItem: TeamItem) {
    return this.teamItemRepository.save(teamItem);
  }

  async deleteTeamItem(teamItemId: number) {
    return this.teamItemRepository.delete({ id: teamItemId });
  }

  async findTeamMemberById(teamMemberId: number) {
    return this.teamMemberRepository.findOne({ id: teamMemberId });
  }

  async findTeamMemberByTeamId(teamId: number) {
    // return this.teamMemberRepository.find({ team_id: teamId });
    return this.teamMemberRepository
      .createQueryBuilder('team_member')
      .select('team_member.*, user.name as name')
      .leftJoin(User, 'user', 'user.uid = team_member.member_uid')
      .where('team_id=:id', { id: teamId })
      .orderBy('addtime', 'DESC')
      .execute();
  }

  async findTeamMemberByIdAndUid(teamId: number, uid: number) {
    return this.teamMemberRepository.findOne({ team_id: teamId, member_uid: uid });
  }

  async saveTeamMember(teamMember: TeamMember) {
    return this.teamMemberRepository.save(teamMember);
  }

  async deleteTeamMember(teamMemberId: number) {
    return this.teamMemberRepository.delete({ id: teamMemberId });
  }

  async findOneTeamItemMember(options: FindConditions<TeamItemMember>) {
    return this.teamItemMemberRepository.findOne(options);
  }

  async findTeamItemMember(options: FindConditions<TeamItemMember>) {
    return this.teamItemMemberRepository.find(options);
  }

  /**
   * 查找 用户 id 关联的所有项目信息
   * @param uid 用户 id
   * @param itemId? 项目 id，可选
   * @param groupId? 组 id
   */
  async findTeamItemMemberByUid(uid: number, itemId?: number, groupId?: number): Promise<TeamItemMember[]> {
    return this.teamItemMemberRepository.find({ member_uid: uid, item_id: itemId, member_group_id: groupId });
  }

  async saveTeamItemMember(item?: TeamItemMember) {
    return this.teamItemMemberRepository.save(item);
  }

  async updateTeamItemMember(teamItemMemId: number, options: QueryDeepPartialEntity<TeamItemMember>) {
    return this.teamItemMemberRepository.update({ id: teamItemMemId }, options);
  }

  async deleteTeamItemMember(options: FindConditions<TeamItemMember>) {
    return this.teamItemMemberRepository.delete(options);
  }
}
