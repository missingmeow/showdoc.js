import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamItemMember } from './entity/team-item-member.entity';
import { TeamItem } from './entity/team-item.entity';
import { TeamMember } from './entity/team-member.entiry';
import { Team } from './entity/team.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { ItemModule } from '../item/item.module';
import { TeamItemController } from './team-item.controller';
import { TeamMemberController } from './team-member.contorller';
import { UserModule } from '../user/user.module';
import { TeamItemMemberController } from './team-item-member.controller';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, TeamItem, TeamMember, TeamItemMember]),
    forwardRef(() => ItemModule),
    forwardRef(() => UserModule),
    forwardRef(() => CatalogModule),
  ],
  providers: [TeamService],
  exports: [TeamService],
  controllers: [TeamController, TeamItemController, TeamMemberController, TeamItemMemberController],
})
export class TeamModule {}
