export type MessageCallback = (result: LLMResult) => void;

export interface ConnectivityCheckResponse {
  isError: boolean;
  msg: string;
  logs: string;
}

export abstract class Base {

  public abstract chat(massages: Message[], llmClientConfig: LLMClientConfig, callback: MessageCallback, stream: boolean): Promise<void>;

  public abstract connectivityCheck(llmClientConfig: LLMClientConfig): Promise<ConnectivityCheckResponse>;

}

export interface LLMClientConfig {
  model_name?: string;
  max_token?: string;
  temperature?: number;
  top_p?: number;
  expand: Map<string, any>;
}

interface Character {
  persona?: string;
  scenario?: string;
  role_name?: string;
  personality?: string;
  examples_of_dialogue?: string;
}

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[]; // 假设是字符串数组，也可以根据具体需求调整
  character?: Character;
};

export class LLMResult {

  private _output: string
  private _done: boolean

  constructor(output: string, done: boolean) {
    this._output = output;
    this._done = done;
  }

  get output(): string {
    return this._output;
  }

  set output(value: string) {
    this._output = value;
  }

  get done(): boolean {
    return this._done;
  }

  set done(value: boolean) {
    this._done = value;
  }
}



