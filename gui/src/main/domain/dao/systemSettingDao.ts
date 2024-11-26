import {Connection, Repository} from 'typeorm';
import {SystemSetting} from "../entitys/systemSetting";
import {BaseDao} from "../../framework/orm/baseDao";

export class SystemSettingDao extends BaseDao<SystemSetting> {

  constructor(connection: Connection) {
    super(connection, SystemSetting);
  }

}
