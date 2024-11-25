import {CharacterChatHistory} from "../../../main/domain/entitys/characterChatHistory";
import {
  CharacterChatHistoryDTO,
  FindPageByCharacterIdDTO,
  FindScrollReadDataDTO
} from "../../../main/domain/dto/characterChatHistoryDTO";

class CharacterChatHistoryHandle {

  async create(characterChatHistoryDTO: CharacterChatHistoryDTO): Promise<CharacterChatHistory> {
    const newCharacterChatHistory = await window.electron.ipcRenderer.invoke('CharacterChatHistoryService', 'create', characterChatHistoryDTO);
    return newCharacterChatHistory;
  }

  async update(characterChatHistoryDTO: CharacterChatHistoryDTO): Promise<CharacterChatHistory> {
    const dbCharacterChatHistory = await window.electron.ipcRenderer.invoke('CharacterChatHistoryService', 'update', characterChatHistoryDTO);
    return dbCharacterChatHistory;
  }

  async findAll(): Promise<CharacterChatHistory[]> {
    return await window.electron.ipcRenderer.invoke('CharacterChatHistoryService', 'findAll', null);
  }

  async findById(id: number): Promise<CharacterChatHistory | null> {
    return await window.electron.ipcRenderer.invoke('CharacterChatHistoryService', 'findById', id);
  }

  async delete(id: number): Promise<void> {
    await window.electron.ipcRenderer.invoke('CharacterChatHistoryService', 'delete', id);
  }

  async findByCharacterId(findPageByCharacterIdDTO: FindPageByCharacterIdDTO): Promise<CharacterChatHistory[]> {
    return await window.electron.ipcRenderer.invoke('CharacterChatHistoryService', 'findByCharacterId', findPageByCharacterIdDTO);
  }

  async findCountByCharacterId(characterId: number): Promise<CharacterChatHistory[]> {
    return await window.electron.ipcRenderer.invoke('CharacterChatHistoryService', 'findCountByCharacterId', characterId);
  }

  async scrollReadData(findScrollReadDataDTO: FindScrollReadDataDTO): Promise<CharacterChatHistory[]> {
    return await window.electron.ipcRenderer.invoke('CharacterChatHistoryService', 'scrollReadData', findScrollReadDataDTO);
  }

}

const characterChatHistoryHandle = new CharacterChatHistoryHandle()
export default characterChatHistoryHandle
