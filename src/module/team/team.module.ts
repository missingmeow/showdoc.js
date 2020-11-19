import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamItemMember } from './entity/team-item-member.entity';
import { TeamItem } from './entity/team-item.entity';
import { TeamMember } from './entity/team-member.entiry';
import { Team } from './entity/team.entity';
import { TeamService } from './team.service';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamItem, TeamMember, TeamItemMember])],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
