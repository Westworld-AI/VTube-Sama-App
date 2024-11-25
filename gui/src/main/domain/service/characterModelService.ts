import { injector } from '../../framework/dependencyInjector';
import { CharacterModelDao } from '../dao/characterModelDao';
import { CharacterModelDTO } from '../dto/characterModelDTO';
import { AutoMapper } from '../../util';

export class CharacterModelService {
  private characterModelDao: CharacterModelDao;

  constructor() {
    this.characterModelDao = injector.resolve(CharacterModelDao);
  }

  async create(characterModelDTO: CharacterModelDTO): Promise<CharacterModelDTO> {
    const newCharacter = await this.characterModelDao.create(characterModelDTO);
    return AutoMapper.map(newCharacter, CharacterModelDTO);
  }

  async update(characterModelDTO: CharacterModelDTO): Promise<void> {
    await this.characterModelDao.update(characterModelDTO.id, characterModelDTO);
    // 这里不需要转换，因为update可能不返回实体
  }

  async findAll(): Promise<CharacterModelDTO[]> {
    const characters = await this.characterModelDao.findAll();
    return AutoMapper.mapArray(characters, CharacterModelDTO);
  }

  async findByInternal(): Promise<CharacterModelDTO[]> {
    const characters = await this.characterModelDao.findByInternal();
    return AutoMapper.mapArray(characters, CharacterModelDTO);
  }

  async findByCustom(): Promise<CharacterModelDTO[]> {
    const characters = await this.characterModelDao.findByCustom();
    return AutoMapper.mapArray(characters, CharacterModelDTO);
  }

  async findById(id: number): Promise<CharacterModelDTO | null> {
    const character = await this.characterModelDao.findById(id);
    if (character) {
      return AutoMapper.map(character, CharacterModelDTO);
    }
    return null;
  }

  async delete(id: number): Promise<void> {
    await this.characterModelDao.delete(id);
    // 删除操作不需要转换DTO
  }
}

