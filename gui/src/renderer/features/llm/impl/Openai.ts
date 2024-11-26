import { Base, ConnectivityCheckResponse, LLMClientConfig, LLMResult, Message, MessageCallback } from '../base';
import OpenAI from 'openai';
import { chatLMMErrorMessage } from '../../../constants/GlobalConstants';


export class OpenaiClient extends Base {

  async chat(massages: Message[], llmClientConfig: LLMClientConfig, callback: MessageCallback, stream: boolean): Promise<void> {
    const apiKey = llmClientConfig.expand.get('api_key');
    const apiBase = llmClientConfig.expand.get('api_base');
    try {

      const openaiMessages = massages.map(msg => ({
        role: msg.role, // 假设sender对应于role
        content: msg.content, // text对应于content
      }));

      const openai = new OpenAI({
        baseURL: apiBase,
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
      const response = await openai.chat.completions.create({
        model: llmClientConfig.model_name,
        messages: openaiMessages,
        stream: stream
      });
      if (stream) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          const finish_reason = chunk.choices[0]?.finish_reason || '';
          if (finish_reason == 'stop') {
            callback(new LLMResult('', true));
          } else {
            callback(new LLMResult(content, false));
          }
        }
      }
    } catch (e) {
      console.error(e);
      callback(new LLMResult(chatLMMErrorMessage, true));
    }
  }

  async connectivityCheck(llmClientConfig: LLMClientConfig): Promise<ConnectivityCheckResponse> {
    const apiKey = llmClientConfig.expand.get('api_key');
    const apiBase = llmClientConfig.expand.get('api_base');
    try {
      const openai = new OpenAI({
        baseURL: apiBase,
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: '请说OK' }],
        model: llmClientConfig.model_name
      });
      return {
        isError: false,
        msg: 'OpenAI 服务连接正常',
        logs: ''
      };
    } catch (e) {
      console.error('openai error :', e);
      return {
        isError: true,
        msg: '未检测到 OpenAI 服务，请检查是否正常启动',
        logs: String(e)
      };
    }
  }
}
