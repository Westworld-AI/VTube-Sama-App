import { Connection } from 'typeorm';
import { Character } from '../entitys/character';
import { BaseDao } from '../../framework/orm/baseDao';

export class CharacterDao extends BaseDao<Character> {

  constructor(connection: Connection) {
    super(connection, Character);
  }

}
