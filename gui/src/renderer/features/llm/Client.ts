import {OllamaClient} from "./impl/ollama";
import {Base, ConnectivityCheckResponse, LLMClientConfig, LLMResult, Message, MessageCallback} from "./base";
import {ZhipuClient} from "./impl/zhipu";
import {OpenaiClient} from "./impl/openai";
import { HunyuanAgentClient } from './impl/HunyuanAgent';

export class LLMClient {

  private llmClientMap: Map<string, Base>;

  constructor() {
    this.llmClientMap = new Map<string, Base>([
      ["ollama", new OllamaClient()],
      ["zhipu", new ZhipuClient()],
      ["openai", new OpenaiClient()],
      ["hunyuanagent", new HunyuanAgentClient()]
    ]);
  }

  async chat(llm_type: string, massages: Message[], llmClientConfig: LLMClientConfig, callback: MessageCallback, stream: boolean): Promise<void> {
    const llmClient = this.llmClientMap.get(llm_type);
    if (!llmClient) {
      return Promise.reject(new LLMResult(`找不到 ${llm_type} 类型的LLM客户端`, true));
    }
    // 如果找到了，正常执行chat函数
    return llmClient.chat(massages, llmClientConfig, callback, stream);
  }

  async connectivityCheck(llm_type: string, llmClientConfig: LLMClientConfig): Promise<ConnectivityCheckResponse> {
    const llmClient = this.llmClientMap.get(llm_type);
    if (!llmClient) {
      const connectivityCheckResponse = {
        isError: true,
        msg: `找不到 ${llm_type} 类型的LLM客户端`,
        logs: ""
      }
      return connectivityCheckResponse;
    }
    return llmClient.connectivityCheck(llmClientConfig);
  }

  async batchConnectivityCheck(llm_type: string, llmClientConfigs: LLMClientConfig[]): Promise<ConnectivityCheckResponse> {
    let connectivityCheckResponse: ConnectivityCheckResponse = {
      isError: true,
      msg: `参数错误，请重新填写后重试！`,
      logs: ""
    };
    for (let llmClientConfig of llmClientConfigs) {
      connectivityCheckResponse = await this.connectivityCheck(llm_type, llmClientConfig)
      if (connectivityCheckResponse.isError) {
        break
      }
    }
    return connectivityCheckResponse;
  }
}


// 通用的SSE响应接口
export interface SSEData {
  event?: string;
  id?: string;
  data: string;
}

// 通用的消息回调类型
export type MessageCallback = (data: SSEData) => void;

// 创建通用SSE客户端基类
export abstract class SSEClient {
  protected url: string;
  protected reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  protected decoder = new TextDecoder();

  constructor(url: string) {
    this.url = url;
  }

  public async start(apiKey: string, body: any, onMessage: MessageCallback): Promise<void> {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body),
      });

      if (!response.body) {
        throw new Error('ReadableStream not available in response');
      }

      this.reader = response.body.getReader();
      await this.readStream(onMessage);
    } catch (error) {
      console.error('Error starting SSE client:', error);
      throw error;
    }
  }

  private async readStream(onMessage: MessageCallback): Promise<void> {
    if (!this.reader) {
      return;
    }
    try {
      const {done, value} = await this.reader.read();
      if (done) {
        console.log('SSE stream completed');
        return;
      }

      const chunk = this.decoder.decode(value, {stream: true});
      this.handleMessage(chunk, onMessage);

      await this.readStream(onMessage);
    } catch (error) {
      console.error('Error reading SSE stream:', error);
    }
  }

  protected abstract handleMessage(chunk: string, onMessage: MessageCallback): void;

  public stop(): void {
    if (this.reader) {
      this.reader.cancel();
      this.reader = null;
      console.log('SSE client stopped');
    }
  }
}


const llmClient = new LLMClient();
export default llmClient;
