import {Connection} from 'typeorm';
import {BaseDao} from "../../framework/orm/baseDao";
import {CharacterModel} from "../entitys/characterModel";

export class CharacterModelDao extends BaseDao<CharacterModel> {

  constructor(connection: Connection) {
    super(connection, CharacterModel);
  }

  async findByInternal() {
    return this.repository.find({
      where: {
        category: "internal"
      }
    });
  }

  async findByCustom() {
    return this.repository.find({
      where: {
        category: "custom"
      }
    });
  }
}
