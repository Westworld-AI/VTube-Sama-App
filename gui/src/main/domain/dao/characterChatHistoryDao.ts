import { Connection, Not, Equal } from 'typeorm';
import { BaseDao } from '../../framework/orm/baseDao';
import { CharacterChatHistory } from '../entitys/characterChatHistory';

export class CharacterChatHistoryDao extends BaseDao<CharacterChatHistory> {

  constructor(connection: Connection) {
    super(connection, CharacterChatHistory);
  }

  async findByCharacterId(characterId: number, page: number, pageSize: number,
                          order: Record<string, 'ASC' | 'DESC'> = { createTime: 'DESC' }): Promise<CharacterChatHistory[]> {
    // 计算跳过的条目数量
    const skip: number = (page - 1) * pageSize;
    // 使用find方法，并传入skip和take选项进行分页
    return this.repository.find({
      where: {
        character_id: characterId
      },
      take: pageSize,
      skip: skip,
      order: order
    });
  }

  async scrollReadData(characterId: number, pageSize: number): Promise<CharacterChatHistory[]> {
    // 利用降序查询获取最新的条目
    const latestMassages = await this.repository.find({
      where: {
        character_id: characterId,
        answer: Not(Equal(''))
      },
      take: pageSize,
      order: {
        createTime: 'DESC' // 降序查询
      }
    });
    // 使用Array.reverse()将数组顺序反转为升序
    return latestMassages.reverse();
  }

  async findCountByCharacterId(characterId: number) {
    return await this.repository.count({
      where: {
        character_id: characterId
      }
    });
  }
}
