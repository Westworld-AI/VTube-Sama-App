import { Character } from '../entitys/character';

export class CharacterDTO {
  id?: number; // 可选，更新时使用
  name?: string;
  describe?: string;
  avatar?: string;
  basic_setting: any;
  definition_setting: any;
  voice_setting: any;
  live_setting: any;
}

export class CharacterFormDTO {

  id?: number;
  name?: string;
  describe?: string;
  avatar?: string;

  // basic_setting
  llm_id?: number;
  character_model_id?: number;
  character_sound_id?: number;

  // definition_setting
  persona?: string;
  personality?: string;
  scenario?: string;
  examples_of_dialogue?: string;

  // voice_setting
  voice_type?: string;
  voice_id?: string;

  constructor(character: Character) {

    this.id = character.id;
    this.name = character.name;
    this.describe = character.describe;
    this.avatar = character.avatar;

    // basic_setting
    this.llm_id = character.basic_setting['llm_id'];
    this.character_model_id = character.basic_setting['character_model_id'];

    // definition_setting
    this.persona = character.definition_setting['persona'];
    this.personality = character.definition_setting['personality'];
    this.scenario = character.definition_setting['scenario'];
    this.examples_of_dialogue = character.definition_setting['examples_of_dialogue'];

    // voice_setting
    this.voice_type = character.voice_setting['voice_type'];
    this.voice_id = character.voice_setting['voice_id'];

  }

  toDTO(): CharacterDTO {

    const characterDTO = new CharacterDTO();
    characterDTO.id = this.id;
    characterDTO.name = this.name;
    characterDTO.describe = this.describe;
    characterDTO.avatar = this.avatar;

    const basic_setting = {
      'llm_id': this.llm_id,
      'character_model_id': this.character_model_id
    };
    characterDTO.basic_setting = basic_setting;

    const definition_setting = {
      'role_name': this.name,
      'persona': this.persona,
      'personality': this.personality,
      'scenario': this.scenario,
      'examples_of_dialogue': this.examples_of_dialogue
    };
    characterDTO.definition_setting = definition_setting;

    const voice_setting = {
      'voice_id': this.voice_id,
      'voice_type': this.voice_type
    };
    characterDTO.voice_setting = voice_setting;
    return characterDTO;
  }

}


