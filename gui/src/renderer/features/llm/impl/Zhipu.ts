import { Base, ConnectivityCheckResponse, LLMClientConfig, LLMResult, Message, MessageCallback } from '../base';
import { chatErrorMessage } from '../../../constants/GlobalConstants';

interface Chatrglm3Meta {
  user_info: string;
  bot_info: string;
  bot_name: string;
  user_name: string;
}

const ZHIPU_ENDPOINT = 'https://open.bigmodel.cn/api/paas';

export class ZhipuClient extends Base {

  async chat(massages: Message[], llmClientConfig: LLMClientConfig, callback: MessageCallback, stream: boolean): Promise<void> {
    try {
      const apiKey = llmClientConfig.expand.get('api_key');
      const modelName = llmClientConfig.model_name;
      const postUrl = ZHIPU_ENDPOINT + '/v4/chat/completions';
      let body = {};
      if (modelName == 'charglm-3') {
        // 初始化会话并获取SSE URL
        const characterMessage = massages.shift();
        body = {
          model: modelName,
          meta: {
            'user_info': '我是Alan',
            'user_name': 'Alan',
            'bot_info': characterMessage.content,
            'bot_name': characterMessage.character.role_name
          },
          messages: massages,
          stream: stream
        };
      } else {
        body = {
          model: modelName,
          messages: massages,
          stream: stream
        };
      }
      const sseClient = new ChatglmSSEClient(postUrl);
      sseClient.start(
        apiKey,
        body,
        (data) => {
          if (data.choices) {
            const content = data.choices[0].delta.content;
            callback(new LLMResult(content, false));
          }
        },
        () => {
          callback(new LLMResult('', true));
        }
      ).catch(error => {
        console.error('Error starting SSE client:', error);
        callback(new LLMResult(chatErrorMessage, true));
      });


    } catch (error) {
      console.log(`An error occurred: ${(error as Error).message}`);
      return callback(new LLMResult(chatErrorMessage, true));
    }
  }

  async connectivityCheck(llmClientConfig: LLMClientConfig): Promise<ConnectivityCheckResponse> {
    let errorMessage = '';
    try {
      const apiKey = llmClientConfig.expand.get('api_key');
      const modelName = llmClientConfig.model_name;
      let response;
      if (modelName == 'charglm-3') {
        response = await this.requestChatrglm3(apiKey, {
          'user_info': '我是管理员',
          'bot_info': '测试Bot',
          'bot_name': '测试Bot',
          'user_name': '管理员'
        }, [
          {
            'role': 'user',
            'content': '请回复OK'
          }
        ]);
      } else {
        response = await this.requestGLM(apiKey, modelName, [
          {
            'role': 'user',
            'content': '请回复OK'
          }
        ], true);
      }
      if (!response.ok) {
        errorMessage = await response.text();
        return {
          isError: true,
          msg: '未检测到 智谱AI 服务，请检查是否正常启动',
          logs: errorMessage
        };
      } else {
        const reader = response?.body?.getReader();
        while (true) {
          const { done, value } = await reader?.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          if (chunk.startsWith('event:add') || chunk.startsWith('data:')) {
            return {
              isError: false,
              msg: '智谱AI 服务连接正常',
              logs: ''
            };
          } else {
            return {
              isError: true,
              msg: '未检测到 智谱AI 服务，请检查是否正常启动',
              logs: chunk
            };
          }
        }
      }
    } catch (e) {
      return {
        isError: true,
        msg: '系统未知错误，请联系管理员',
        logs: String(e)
      };
    }
  }

  private async requestGLM(apiKey: string, modelName: string | undefined, massages: Message[], stream: boolean) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    const body = {
      'model': modelName,
      'messages': massages,
      'stream': stream
    };
    return await fetch(ZHIPU_ENDPOINT + '/v4/chat/completions', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
  }

  private async requestChatrglm3(apiKey: string, chatrglm3Meta: Chatrglm3Meta, massages: Message[]) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    const body = {
      'meta': chatrglm3Meta,
      'prompt': massages
    };
    return await fetch(ZHIPU_ENDPOINT + '/v3/model-api/charglm-3/sse-invoke', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
  }
}

interface ChatglmSSEResponseData {
  data: string;
}

interface ChatglmSSEData {
  id: string,
  created: number,
  model: string,
  choices: [{
    index: number,
    finish_reason: string,
    delta: {
      role: string,
      content: string
    }
  }],
}

type ChatglmMessageCallback = (data: ChatglmSSEData) => void;
type ChatglmMetaDataCallback = () => void;

class ChatglmSSEClient {

  private url: string;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private decoder = new TextDecoder();

  constructor(url: string) {
    this.url = url;
  }

  public async start(apiKey: string, body: any, onMessage: ChatglmMessageCallback, onFinish: ChatglmMetaDataCallback): Promise<void> {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });

      if (!response.body || !response.ok) {
        throw new Error('ReadableStream not available in response');
      }

      // Setup the reader and start processing the stream
      this.reader = response.body.getReader();
      return this.processStream(onMessage, onFinish);
    } catch (error) {
      console.error('Error starting SSE client:', error);
      throw error;
    }
  }

  private async processStream(onMessage: ChatglmMessageCallback, onFinish: ChatglmMetaDataCallback): Promise<void> {
    if (!this.reader) {
      return;
    }
    try {
      const { done, value } = await this.reader.read();
      if (done) {
        console.log('SSE stream completed');
        return;
      }
      // Decode stream's value to string
      const chunk = this.decoder.decode(value, { stream: true });
      // Handle SSE messages from chunk
      this.handleSSEMessages(chunk, onMessage, onFinish);
      // Recursive call for processing next part of the stream
      await this.processStream(onMessage, onFinish);
    } catch (error) {
      onMessage({
        id: 'error',
        created: -1,
        model: '',
        choices: [{
          index: -1,
          finish_reason: '',
          delta: {
            role: '',
            content: chatErrorMessage
          }
        }]
      });
      onFinish();
      console.error('Error reading SSE stream:', error);
    }
  }

  private handleSSEMessages(chunk: string, onMessage: ChatglmMessageCallback, onFinish: ChatglmMetaDataCallback): void {
    const messages = chunk.split('\n\n');
    for (const message of messages) {
      if (message.trim() === '') continue;

      const lines = message.split('\n');
      const sseData: ChatglmSSEResponseData = {
        data: '{}'
      };

      for (const line of lines) {
        if (line.startsWith('data:')) {
          sseData.data = line.replace('data:', '');
        }
      }

      if (sseData.data.includes('[DONE]')) {
        onFinish();
        this.stop();
      } else {
        const chatgSSEData: ChatglmSSEData = JSON.parse(sseData.data);
        if (chatgSSEData.choices) {
          onMessage(chatgSSEData);
        }
      }
    }
  }

  public stop(): void {
    if (this.reader) {
      this.reader.cancel();
      this.reader = null;
    }
  }
}
