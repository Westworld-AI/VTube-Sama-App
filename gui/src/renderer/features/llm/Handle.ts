import { LLMConnectDTO, LLMConnectListDTO } from '../../../main/domain/dto/llmConnectDTO';
import systemSettingHandle from '../system/systemSettingHandle';
import { LLMSettingDTO, SystemSettingDTO } from '../../../main/domain/dto/systemSettingDTO';

export class Handle {

  async list(): Promise<LLMConnectListDTO[]> {
    const llmConnects = await this.getLlmConnects();
    const llmConnectLists = llmConnects.map(llmConnect => {
      return new LLMConnectListDTO(llmConnect.id, llmConnect.name);
    });
    return llmConnectLists;
  }

  async get(id: string): Promise<LLMConnectDTO | undefined> {
    const llmConnects = await this.getLlmConnects();
    const llmConnect = llmConnects.filter(a => a.id == id).shift();
    return llmConnect;
  }

  private async getLlmConnects() {
    const llmConnects: LLMConnectDTO[] = [];
    const systemSetting = await systemSettingHandle.getSystemSetting();
    this.addOpenaiConnect(systemSetting, llmConnects);
    this.addOllamaConnect(systemSetting, llmConnects);
    this.addZhipuConnect(systemSetting, llmConnects);
    this.addHunyuanagentConnect(systemSetting, llmConnects);
    return llmConnects;
  }

  private addOllamaConnect(systemSetting: SystemSettingDTO, llmConnects: LLMConnectDTO[]) {
    const ollamaSetting: LLMSettingDTO = systemSetting.llm_setting?.ollama;
    if (ollamaSetting?.enabled) {
      const apiBase: string = ollamaSetting.extended_attributes?.api_base;
      const modelNames: string[] = ollamaSetting.extended_attributes?.model_names;
      modelNames.forEach(modelName => {
        const expand = new Map<string, any>();
        expand.set('api_base', apiBase);
        llmConnects.push({
          id: `ollama-${modelName}`,
          name: `ollama-${modelName}`,
          model_name: modelName,
          llm_type: 'ollama',
          max_token: 4090,
          temperature: 0.8,
          top_p: 0.9,
          expand: expand
        });
      });
    }
  }

  private addZhipuConnect(systemSetting: SystemSettingDTO, llmConnects: LLMConnectDTO[]) {
    const zhipuSetting: LLMSettingDTO = systemSetting.llm_setting?.zhipu;
    if (zhipuSetting?.enabled) {
      const apiKey: string = zhipuSetting.extended_attributes?.api_key;
      const modelNames: string[] = zhipuSetting.extended_attributes?.model_names;
      modelNames.forEach(modelName => {
        const expand = new Map<string, any>();
        expand.set('api_key', apiKey);
        llmConnects.push({
          id: `zhipu-${modelName}`,
          name: `zhipu-${modelName}`,
          model_name: modelName,
          llm_type: 'zhipu',
          max_token: 4090,
          temperature: 0.8,
          top_p: 0.9,
          expand: expand
        });
      });
    }
  }

  private addHunyuanagentConnect(systemSetting: SystemSettingDTO, llmConnects: LLMConnectDTO[]) {
    const hunyuanagentSetting: LLMSettingDTO = systemSetting.llm_setting?.hunyuanagent;
    if (hunyuanagentSetting?.enabled) {
      const apiKey: string = hunyuanagentSetting.extended_attributes?.api_key;
      const assistantId: string = hunyuanagentSetting.extended_attributes?.assistant_id;
      const modelNames: string[] = hunyuanagentSetting.extended_attributes?.model_names;
      modelNames.forEach(modelName => {
        const expand = new Map<string, any>();
        expand.set('api_key', apiKey);
        expand.set('assistant_id', assistantId);
        llmConnects.push({
          id: `hunyuanagent-${modelName}`,
          name: `hunyuanagent-${modelName}`,
          model_name: modelName,
          llm_type: 'hunyuanagent',
          max_token: 4090,
          temperature: 0.8,
          top_p: 0.9,
          expand: expand
        });
      });
    }
  }

  private addOpenaiConnect(systemSetting: SystemSettingDTO, llmConnects: LLMConnectDTO[]) {
    const openaiSetting: LLMSettingDTO = systemSetting.llm_setting?.openai;
    if (openaiSetting?.enabled) {
      const apiKey: string = openaiSetting.extended_attributes?.api_key;
      const apiBase: string = openaiSetting.extended_attributes?.api_base;
      const modelNames: string[] = openaiSetting.extended_attributes?.model_names;
      modelNames.forEach(modelName => {
        const expand = new Map<string, any>();
        expand.set('api_key', apiKey);
        expand.set('api_base', apiBase);
        llmConnects.push({
          id: `openai-${modelName}`,
          name: `openai-${modelName}`,
          model_name: modelName,
          llm_type: 'openai',
          max_token: 4090,
          temperature: 0.8,
          top_p: 0.9,
          expand: expand
        });
      });
    }
  }
}

const llmConnectHandle = new Handle();
export default llmConnectHandle;
