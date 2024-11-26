import {VoiceOptionDTO, VoiceSynthesisDTO} from '../../../main/domain/dto/voiceDTO';

export class VoiceHandle {

  async synthesis(voiceType: string, voiceId: string, text: string, config: Map<string, string>): Promise<String> {
    const voiceSynthesisDTO = new VoiceSynthesisDTO(voiceType, voiceId, text, config);
    return await window.electron.ipcRenderer.invoke('VoiceService', 'synthesis', voiceSynthesisDTO);
  }

  async deleteVoiceFile(filePath: string): Promise<boolean> {
    return await window.electron.ipcRenderer.invoke('VoiceService', 'deleteVoiceFile', filePath);
  }

  async getVoiceOptions(voiceType: string): Promise<VoiceOptionDTO[]> {
    if (voiceType === 'edge-tts') {
      return await window.electron.ipcRenderer.invoke('VoiceService', 'getEdgeTTsOptions', null);
    } else if (voiceType === 'gpt-sovits') {
      return await window.electron.ipcRenderer.invoke('VoiceService', 'getGptSoVitsOptions', null);
    } else {
      throw new Error('Invalid voice type');
    }
  }

}


const TEXT_SEGMENTATION_REGEX = '^(.+[。．！？\n]|.{20,}[、,])';

export class TextSegmentation {

  textSnippet: string;
  regex: RegExp;

  constructor() {
    this.textSnippet = '';
    this.regex = new RegExp(TEXT_SEGMENTATION_REGEX);
  }

  add(text: string): void {
    this.textSnippet += text;
  }

  isDone(): boolean {

    if (!this.textSnippet) {
      return false;
    }

    this.regex.lastIndex = 0;
    const match = this.regex.exec(this.textSnippet);
    return match !== null;
  }

  output(): string {
    return this.textSnippet;
  }

  clear(): void {
    this.textSnippet = '';
  }

}

const voiceHandle = new VoiceHandle();
export default voiceHandle;
