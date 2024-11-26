import {injector} from "../../framework/dependencyInjector";
import {SystemSettingDao} from "../dao/systemSettingDao";
import {SystemSettingDTO} from "../dto/systemSettingDTO";
import {SystemSetting} from "../entitys/systemSetting";

export class SystemSettingService {
  private systemSettingDao: SystemSettingDao;

  constructor() {
    this.systemSettingDao = injector.resolve(SystemSettingDao);
  }

  async create(systemSettingDTO: SystemSettingDTO): Promise<SystemSetting> {
    return await this.systemSettingDao.create(systemSettingDTO);
  }

  async findAll(): Promise<SystemSetting[]> {
    return await this.systemSettingDao.findAll();
  }

  async findById(id: number): Promise<SystemSetting | null> {
    return await this.systemSettingDao.findById(id);
  }

  async update(systemSettingDTO: SystemSettingDTO): Promise<void> {
    await this.systemSettingDao.update(systemSettingDTO.id, systemSettingDTO);
  }

  async delete(id: number): Promise<void> {
    await this.systemSettingDao.delete(id);
  }
}

