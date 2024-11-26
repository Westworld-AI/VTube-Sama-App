export class VoiceSynthesisDTO {

  voiceType: string;
  voiceId: string;
  text: string;
  config: Map<string, string>;


  constructor(voiceType: string, voiceId: string, text: string, config: Map<string, string>) {
    this.voiceType = voiceType;
    this.voiceId = voiceId;
    this.text = text;
    this.config = config;
  }
}

export class VoiceOptionDTO {

  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
