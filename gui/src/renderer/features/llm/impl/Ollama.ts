import { Base, ConnectivityCheckResponse, LLMClientConfig, LLMResult, Message, MessageCallback } from '../base';
import { chatErrorMessage } from '../../../constants/GlobalConstants';

type ChatResponse = {
  done: boolean;
  model: string;
  created_at: string;
  message?: Message;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
};

export class OllamaClient extends Base {

  async chat(massages: Message[], llmClientConfig: LLMClientConfig, callback: MessageCallback, stream: boolean): Promise<void> {
    const api_base = llmClientConfig.expand.get('api_base');
    const body = {
      model: llmClientConfig.model_name,
      messages: massages,
      options: {
        temperature: llmClientConfig.temperature,
        // max_token: llmClientConfig.max_token,
        top_p: llmClientConfig.top_p
      },
      stream: stream
    };
    let error_message = '';
    try {
      const response = await fetch(api_base + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        error_message = `Error from server: ${response.status} ${response.statusText}`;
        console.error(error_message);
        return callback(new LLMResult(chatErrorMessage, true));
      }

      if (stream) {
        const reader = response?.body?.getReader();
        while (true) {
          const { done, value } = await reader?.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          try {
            const json: ChatResponse = JSON.parse(chunk);
            if (json.message) {
              callback(new LLMResult(json.message.content, false));
            }
            if (json.done) {
              callback(new LLMResult('', true));
              break;
            }
          } catch (error) {
            error_message = `Error parsing JSON: ${chunk}`;
            console.error(error_message);
            return callback(new LLMResult(chatErrorMessage, true));
            break;
          }
        }
      } else {
        const json: ChatResponse = await response.json();
        // 如果不是流式传输，就处理单个响应
        if (json.message) {
          callback(new LLMResult(json.message.content, true));
        }
      }
    } catch (error) {
      error_message = `An error occurred: ${(error as Error).message}`;  // 这里捕获异步代码块中的错误
      console.error(error_message);
      return callback(new LLMResult(chatErrorMessage, true));
    }
  }

  async connectivityCheck(llmClientConfig: LLMClientConfig): Promise<ConnectivityCheckResponse> {
    let error_message = '';
    try {
      console.log('tes llmClientConfig:', llmClientConfig);
      const api_base = llmClientConfig.expand.get('api_base');
      const body = {
        'name': llmClientConfig.model_name
      };
      const response = await fetch(api_base + '/api/show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        error_message = await response.text();
        return {
          isError: true,
          msg: '未检测到 Ollama 服务，请检查是否正常启动',
          logs: error_message
        };
      } else {
        return {
          isError: false,
          msg: 'Ollama 服务连接正常',
          logs: ''
        };
      }
    } catch (e) {
      return {
        isError: true,
        msg: '系统未知错误，请联系管理员',
        logs: String(e)
      };
    }
  }
}
