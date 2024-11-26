import { CharacterModel } from '../../../main/domain/entitys/characterModel';
import fileServiceHandle from '../file/FileUtils';
import { CharacterModelDTO } from '../../../main/domain/dto/characterModelDTO';
import { characterDefaultImageSrc } from '../../constants/GlobalConstants';
import { UploadFileResultDTO } from '../../../main/domain/dto/UploadFileDTO';

const CharacterModelTypeEnum = {
  Live2D: 'Live2D',
  VRM: 'VRM'
} as const;

const CharacterModelCategoryEnum = {
  internal: 'internal',
  custom: 'custom'
} as const;

export class CharacterModelHandle {

  async upload(filePath: string): Promise<boolean> {

    let isError = false;
    try {
      const res = await fileServiceHandle.uploadLive2d(filePath);
      const characterModelDTO = new CharacterModelDTO(
        null,
        res.fileName,
        CharacterModelCategoryEnum.custom,
        CharacterModelTypeEnum.Live2D,
        characterDefaultImageSrc,
        res.filePath,
        null,
        '',
        {},
        {}
      );
      await this.create(characterModelDTO);
    } catch (e) {
      console.log('update model error', e);
      isError = true;
    }
    return isError;
  }

  async uploadImage(filePath: string): Promise<UploadFileResultDTO> {
    return await fileServiceHandle.uploadImage(filePath);
  }

  async list(): Promise<CharacterModelDTO[]> {
    return await window.electron.ipcRenderer.invoke('CharacterModelService', 'findAll', null);
  }

  async get(id: number): Promise<CharacterModelDTO> {
    return await window.electron.ipcRenderer.invoke('CharacterModelService', 'findById', id);
  }

  async create(characterModelDTO: CharacterModelDTO): Promise<CharacterModelDTO> {
    const newCharacterModel = await window.electron.ipcRenderer.invoke('CharacterModelService', 'create', characterModelDTO);
    return newCharacterModel;
  }

  async update(characterModelDTO: CharacterModelDTO): Promise<void> {
    await window.electron.ipcRenderer.invoke('CharacterModelService', 'update', characterModelDTO);
  }

  async findByInternal(): Promise<CharacterModelDTO[]> {
    return await window.electron.ipcRenderer.invoke('CharacterModelService', 'findByInternal', null);
  }

  async findByCustom(): Promise<CharacterModelDTO[]> {
    return await window.electron.ipcRenderer.invoke('CharacterModelService', 'findByCustom', null);
  }

  async delete(id: number): Promise<void> {
    await window.electron.ipcRenderer.invoke('CharacterModelService', 'delete', id);
  }

}

const characterModelHandle = new CharacterModelHandle();
export default characterModelHandle;
