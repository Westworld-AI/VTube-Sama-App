export class LLMConnectListDTO {
  id?: string;
  name?: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class LLMConnectDTO {
  id: string;
  name: string;
  model_name: string;
  llm_type: string;
  max_token: number;
  temperature: number;
  top_p: number;
  expand: any

  constructor(id: string, name: string, model_name: string, llm_type: string, max_token: number, temperature: number, top_p: number, expand: any) {
    this.id = id;
    this.name = name;
    this.model_name = model_name;
    this.llm_type = llm_type;
    this.max_token = max_token;
    this.temperature = temperature;
    this.top_p = top_p;
    this.expand = expand;
  }
}
