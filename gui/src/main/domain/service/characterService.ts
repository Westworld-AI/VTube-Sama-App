import { injector } from '../../framework/dependencyInjector';
import { CharacterDao } from '../dao/characterDao';
import { CharacterDTO, CharacterFormDTO } from '../dto/characterDTO';
import { Character } from '../entitys/character';
import { CharacterModelService } from './characterModelService';
import { CharacterModelDTO } from '../dto/characterModelDTO';

export class CharacterService {
  private characterDao: CharacterDao;
  private characterModelService: CharacterModelService;

  constructor() {
    this.characterDao = injector.resolve(CharacterDao);
    this.characterModelService = new CharacterModelService();
  }

  async create(characterData: CharacterDTO): Promise<Character> {
    const newCharacter = await this.characterDao.create(characterData);
    return newCharacter;
  }

  async update(characterData: CharacterDTO): Promise<void> {
    await this.characterDao.update(characterData.id, characterData);
  }

  async findAll(): Promise<Character[]> {
    const characters = await this.characterDao.findAll();
    for (let character of characters) {
      const character_model_id = character.basic_setting.character_model_id;
      const characterModelDTO = await this.characterModelService.findById(character_model_id);
      if (characterModelDTO) {
        character.avatar = characterModelDTO.icon_path;
      }
    }
    return characters;
  }

  async findById(id: number): Promise<Character | null> {
    return await this.characterDao.findById(id);
  }

  // 删除角色
  async delete(id: number): Promise<void> {
    await this.characterDao.delete(id);
  }
}

