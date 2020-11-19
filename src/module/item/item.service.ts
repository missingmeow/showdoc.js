import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemMember } from './entity/item-member.entity';
import { Item } from './entity/item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemMember)
    private readonly itemMemberRepository: Repository<ItemMember>,
  ) {}

  async findAllItem(): Promise<Item[]> {
    return this.itemRepository.find();
  }

  async findItemMember(uid: number): Promise<ItemMember[]> {
    return this.itemMemberRepository.find({ uid });
  }

  async findItem(uid: number, itemIds: number[]): Promise<any[]> {
    return this.itemRepository
      .createQueryBuilder()
      .select([
        'item_id',
        'uid',
        'item_name',
        'item_domain',
        'item_type',
        'last_update_time',
        'item_description',
        'is_del',
        'password',
      ])
      .where('(uid=:id OR item_id IN (:...ids))', { id: uid, ids: itemIds })
      .andWhere('is_del=:del', { del: 0 })
      .orderBy('item_id', 'ASC')
      .execute();
  }
}
