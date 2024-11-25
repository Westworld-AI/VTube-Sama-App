import {SystemSetting} from "../../../main/domain/entitys/systemSetting";
import {SystemSettingDTO} from "../../../main/domain/dto/systemSettingDTO";

const SYSTEM_SETTING_KEY = 1;

export class SystemSettingHandle {

  async create(systemSettingDTO: SystemSettingDTO): Promise<SystemSetting> {
    const newCharacter = await window.electron.ipcRenderer.invoke('SystemSettingService', 'create', systemSettingDTO);
    return newCharacter;
  }

  async update(systemSettingDTO: SystemSettingDTO): Promise<SystemSetting> {
    const dbCharacter = await window.electron.ipcRenderer.invoke('SystemSettingService', 'update', systemSettingDTO);
    return dbCharacter;
  }

  async findAll(): Promise<SystemSetting[]> {
    return await window.electron.ipcRenderer.invoke('SystemSettingService', 'findAll', null);
  }

  async findById(id: number): Promise<SystemSetting | null> {
    return await window.electron.ipcRenderer.invoke('SystemSettingService', 'findById', id);
  }

  async delete(id: number): Promise<void> {
    await window.electron.ipcRenderer.invoke('SystemSettingService', 'delete', id);
  }

  async createAndUpdateSystemSetting(systemSettingDTO: SystemSettingDTO): Promise<void> {
    if (systemSettingDTO.id != null) {
      systemSettingDTO.id = SYSTEM_SETTING_KEY;
      await this.update(systemSettingDTO);
    } else {
      systemSettingDTO.id = SYSTEM_SETTING_KEY;
      await this.create(systemSettingDTO);
    }
  }

  async getSystemSetting(): Promise<SystemSettingDTO> {
    const systemSetting = await this.findById(SYSTEM_SETTING_KEY);
    if (systemSetting) {
      return SystemSettingDTO.toDTO(systemSetting);
    } else {
      return null;
    }
  }
}

const systemSettingHandle = new SystemSettingHandle();
export default systemSettingHandle;
