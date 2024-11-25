import { SystemSetting } from '../entitys/systemSetting';

class SystemSettingDTO {
  id?: number;
  language?: string;
  home_setting?: any;
  llm_setting?: any;
  live_setting?: any;

  static toDTO(systemSetting: SystemSetting) {
    const systemSettingDTO = new SystemSettingDTO();
    systemSettingDTO.id = systemSetting.id;
    systemSettingDTO.language = systemSetting.language;
    // systemSettingDTO.home_setting = {
    //   character_id: systemSetting.home_setting['character_id']
    // };
    systemSettingDTO.home_setting = systemSetting.home_setting;
    systemSettingDTO.llm_setting = systemSetting.llm_setting;
    systemSettingDTO.live_setting = systemSetting.live_setting;
    return systemSettingDTO;
  }
}

class HomeSettingDTO {

  character_id: string;
  background_src: string;
  live_client: string;
  constructor(character_id: string, background_src: string, live_client: string) {
    this.character_id = character_id;
    this.background_src = background_src;
    this.live_client = live_client;
  }
}

class LLMSettingDTO {

  llm_type: string;
  enabled: boolean;
  extended_attributes: any;

  constructor(llm_type: string, enabled: boolean, extended_attributes: any) {
    this.llm_type = llm_type;
    this.enabled = enabled;
    this.extended_attributes = extended_attributes;
  }
}

class LiveSettingDTO {
  live_type: string;
  enabled: boolean;
  extended_attributes: any;

  constructor(live_type: string, enabled: boolean, extended_attributes: any) {
    this.live_type = live_type;
    this.enabled = enabled;
    this.extended_attributes = extended_attributes;
  }
}


export { LLMSettingDTO, SystemSettingDTO, LiveSettingDTO, HomeSettingDTO };
