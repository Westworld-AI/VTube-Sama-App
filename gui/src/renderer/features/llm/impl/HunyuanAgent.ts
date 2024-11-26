import { Base, ConnectivityCheckResponse, LLMClientConfig, LLMResult, Message, MessageCallback } from '../base';
import { chatErrorMessage } from '../../../constants/GlobalConstants';

const HUNYUAN_AGENT_ENDPOINT = 'https://yuanqi.tencent.com/openapi/v1/agent/chat/completions';


export class HunyuanAgentClient extends Base {

  async chat(massages: Message[], llmClientConfig: LLMClientConfig, callback: MessageCallback, stream: boolean): Promise<void> {
    try {
      const apiKey = llmClientConfig.expand.get('api_key');
      const assistantId = llmClientConfig.expand.get('assistant_id');
      const userId = 'chat';
      massages.shift();
      // 将messages转换为payload所需的格式
      const transformedMessages = massages.map(message => {
        let contentArray = [];
        // 处理文本内容
        if (message.content) {
          contentArray.push({
            type: 'text',
            text: message.content
          });
        }
        // 返回转换后的message格式
        return {
          role: message.role,
          content: contentArray
        };
      });
      const payload = {
        'assistant_id': assistantId,
        'user_id': userId,
        'stream': stream,
        'messages': transformedMessages
      };

      const sseClient = new HunyuanAgentSSEClient(HUNYUAN_AGENT_ENDPOINT);
      sseClient.start(
        apiKey,
        payload,
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
    const apiKey = llmClientConfig.expand.get('api_key');
    const assistantId = llmClientConfig.expand.get('assistant_id');
    const userId = 'connectivityCheck';

    try {
      const payload = {
        'assistant_id': assistantId,
        'user_id': userId,
        'stream': false,
        'messages': [{
          'role': 'user',
          'content': [{
            'type': 'text',
            'text': '请回复OK'
          }]
        }]
      };
      // 发送一个HEAD请求，这样我们不需要处理返回的body，只关心响应的状态码
      const response = await fetch(HUNYUAN_AGENT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      // 检查响应是否成功
      if (response.ok) {
        console.log('response：', response.json());
        return {
          isError: false,
          msg: '腾讯元器服务连接正常',
          logs: ''
        };
      } else {
        // 响应状态不是2xx，视为连接错误
        return {
          isError: true,
          msg: `连接到服务失败，状态码：${response.status}`,
          logs: ''
        };
      }
    } catch (error) {
      // 捕获网络或其他错误
      return {
        isError: true,
        msg: '连接到服务时发生未知错误',
        logs: (error as Error).message
      };
    }
  }
}

interface ChatglmSSEResponseData {
  data: string;
}

interface HunyuanAgentSSEData {
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

type HunyuanAgentMessageCallback = (data: HunyuanAgentSSEData) => void;
type HunyunaAgentMetaDataCallback = () => void;

class HunyuanAgentSSEClient {

  private url: string;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private decoder = new TextDecoder();

  constructor(url: string) {
    this.url = url;
  }

  public async start(apiKey: string, body: any, onMessage: HunyuanAgentMessageCallback, onFinish: HunyunaAgentMetaDataCallback): Promise<void> {
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

  private async processStream(onMessage: HunyuanAgentMessageCallback, onFinish: HunyunaAgentMetaDataCallback): Promise<void> {
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

  private handleSSEMessages(chunk: string, onMessage: HunyuanAgentMessageCallback, onFinish: HunyunaAgentMetaDataCallback): void {
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
        const chatgSSEData: HunyuanAgentSSEData = JSON.parse(sseData.data);
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
