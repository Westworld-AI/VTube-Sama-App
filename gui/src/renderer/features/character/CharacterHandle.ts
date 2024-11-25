import { Character } from '../entitys/character';
import { CharacterDTO, CharacterFormDTO } from '../../../main/domain/dto/characterDTO';


export class CharacterHandle {

  toDTO(characterFormDTO: CharacterFormDTO): CharacterDTO {

    const characterDTO = new CharacterDTO();
    characterDTO.id = characterFormDTO.id;
    characterDTO.name = characterFormDTO.name;
    characterDTO.describe = characterFormDTO.describe;
    characterDTO.avatar = characterFormDTO.avatar;

    const basic_setting = {
      'llm_id': characterFormDTO.llm_id,
      'character_model_id': characterFormDTO.character_model_id
    };
    characterDTO.basic_setting = basic_setting;

    const definition_setting = {
      'role_name': characterFormDTO.name,
      'persona': characterFormDTO.persona,
      'personality': characterFormDTO.personality,
      'scenario': characterFormDTO.scenario,
      'examples_of_dialogue': characterFormDTO.examples_of_dialogue
    };
    characterDTO.definition_setting = definition_setting;


    const voice_setting = {
      'voice_id': characterFormDTO.voice_id,
      'voice_type': characterFormDTO.voice_type
    };
    characterDTO.voice_setting = voice_setting;

    return characterDTO;
  }

  async create(characterData: CharacterDTO): Promise<Character> {
    const newCharacter = await window.electron.ipcRenderer.invoke('CharacterService', 'create', characterData);
    return newCharacter;
  }

  async update(characterFormDTO: CharacterFormDTO): Promise<Character> {
    const characterDTO = this.toDTO(characterFormDTO);
    const dbCharacter = await window.electron.ipcRenderer.invoke('CharacterService', 'update', characterDTO);
    return dbCharacter;
  }

  async findAll(): Promise<Character[]> {
    return await window.electron.ipcRenderer.invoke('CharacterService', 'findAll', null);
  }

  async findById(id: number): Promise<Character | null> {
    return await window.electron.ipcRenderer.invoke('CharacterService', 'findById', id);
  }

  async delete(id: number): Promise<void> {
    await await window.electron.ipcRenderer.invoke('CharacterService', 'delete', id);
  }


}

const characterHandle = new CharacterHandle();
export default characterHandle;

