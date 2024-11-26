import characterChatHistoryHandle from "../memory/chatHistroyHandle";
import {LLMResult, Message} from "../llm/base";
import characterChatHandle, {MessageRoleType} from "../character/characterChatHandle";

interface ChatParam {
  messageSource: MessageSource;
  sender: string;
  query: string;
  llm_id: string;
  characterId: number;
  persona: string;
  scenario: string;
  role_name: string;
  personality: string;
  examples_of_dialogue: string;
  callback: (llmResult: LLMResult) => void;
}

export type MessageSource = 'client' | 'B站' | '抖音';

class AgentHandle {

  async chat(chatParam: ChatParam) {

    const shortMemory = await this.getShortMemory(chatParam);
    let answer = ""
    await characterChatHandle.chat({
      query: chatParam.query,
      llm_id: chatParam.llm_id,
      persona: chatParam.persona,
      scenario: chatParam.scenario,
      role_name: chatParam.role_name,
      personality: chatParam.personality,
      shortMemory: shortMemory,
      examples_of_dialogue: chatParam.examples_of_dialogue,
      callback: (llmResult: LLMResult) => {
        chatParam.callback(llmResult);
        if (!llmResult.done) {
          answer = answer + llmResult.output;
        } else {
          this.saveShortMemory(chatParam, answer);
        }
      }
    });
  }

  private async saveShortMemory(chatParam: ChatParam, answer: string) {
    if (chatParam.characterId != -1) {
      await characterChatHistoryHandle.create({
        character_id: chatParam.characterId,
        source: chatParam.messageSource,
        sender: chatParam.sender,
        question: chatParam.query,
        answer: answer
      })
    }
  }

  private async getShortMemory(chatParam: ChatParam): Promise<Message[]> {
    if (chatParam.characterId == -1) {
      return []
    }
    const chatHistorys = await characterChatHistoryHandle.scrollReadData({
      characterId: chatParam.characterId,
      pageSize: 3,
    })
    const shortMemory: Message[] = []
    chatHistorys.forEach((chatHistory) => {
      shortMemory.push({
        role: 'user',
        content: chatHistory.question
      });
      shortMemory.push({
        role: 'assistant',
        content: chatHistory.answer
      });
    });
    return shortMemory;
  }
}


const agentHandle = new AgentHandle()
export default agentHandle
