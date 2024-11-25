import {injector} from "../../framework/dependencyInjector";
import {CharacterChatHistoryDao} from "../dao/characterChatHistoryDao";
import {CharacterChatHistory} from "../entitys/characterChatHistory";
import {CharacterChatHistoryDTO, FindPageByCharacterIdDTO, FindScrollReadDataDTO} from "../dto/characterChatHistoryDTO";

export class CharacterChatHistoryService {
  private characterChatHistoryDao: CharacterChatHistoryDao;

  constructor() {
    this.characterChatHistoryDao = injector.resolve(CharacterChatHistoryDao);
  }

  async create(characterChatHistoryDTO: CharacterChatHistoryDTO): Promise<CharacterChatHistory> {
    const newCharacter = await this.characterChatHistoryDao.create(characterChatHistoryDTO);
    return newCharacter;
  }

  async update(characterChatHistoryDTO: CharacterChatHistoryDTO): Promise<void> {
    await this.characterChatHistoryDao.update(characterChatHistoryDTO.id, characterChatHistoryDTO);
  }

  async findAll(): Promise<CharacterChatHistory[]> {
    return await this.characterChatHistoryDao.findAll();
  }

  async findById(id: number): Promise<CharacterChatHistory | null> {
    return await this.characterChatHistoryDao.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.characterChatHistoryDao.delete(id);
  }

  async findByCharacterId(findPageByCharacterIdDTO: FindPageByCharacterIdDTO): Promise<CharacterChatHistory[]> {
    return await this.characterChatHistoryDao.findByCharacterId(findPageByCharacterIdDTO.characterId, findPageByCharacterIdDTO.page, findPageByCharacterIdDTO.pageSize, findPageByCharacterIdDTO.order);
  }

  async findCountByCharacterId(characterId?: number): Promise<number> {
    return await this.characterChatHistoryDao.findCountByCharacterId(characterId);
  }

  async scrollReadData(findScrollReadDataDTO: FindScrollReadDataDTO): Promise<CharacterChatHistory[]> {
    return await this.characterChatHistoryDao.scrollReadData(findScrollReadDataDTO.characterId, findScrollReadDataDTO.pageSize);
  }

}

