import llmConnectHandle from '../llm/handle';
import llmClient from '../llm/client';
import {LLMResult, Message} from '../llm/base';
import characterDefinitionHandle from './characterDefinitionHandle';
import {format} from 'date-fns';
import {zhCN} from 'date-fns/locale';
import visionHandle from "../vision/VisionHandle";

interface ChatArgs {
  query: string;
  llm_id: string;
  persona: string;
  scenario: string;
  role_name: string;
  personality: string;
  examples_of_dialogue: string;
  shortMemory: Message[];
  callback: (llmResult: LLMResult) => void;
}

export class CharacterChatHandle {

  async chat(args: ChatArgs) {
    const currentData = format(new Date(), 'PPpp', {locale: zhCN});
    const vision = await visionHandle.getLast() ?? "null";
    const prompt = characterDefinitionHandle.build({
      persona: args.persona,
      scenario: args.scenario,
      role_name: args.role_name,
      personality: args.personality,
      examples_of_dialogue: args.examples_of_dialogue,
      long_history: '',
      current_time: currentData,
      vision: vision
    });
    console.log("prompt", prompt);
    llmConnectHandle.get(args.llm_id).then(llmConnect => {

      if (!llmConnect) {
        const errorLLMResult = new LLMResult('我的大脑出现了问题，请检查角色中，人物角色的大模型配置是否正确', true);
        args.callback(errorLLMResult);
        return;
      }

      const massages: Message[] = [];
      massages.push({
        role: 'system',
        content: prompt,
        character: {
          persona: args.persona,
          scenario: args.scenario,
          role_name: args.role_name,
          personality: args.personality,
          examples_of_dialogue: args.examples_of_dialogue
        }
      });
      if (args.shortMemory.length > 0) {
        args.shortMemory.forEach(item => {
          massages.push(item);
        });
      }
      massages.push({
        role: 'user',
        content: args.query
      });
      llmClient.chat(llmConnect.llm_type, massages, llmConnect, args.callback, true);
    });
  }
}


const characterChatHandle = new CharacterChatHandle();
export default characterChatHandle;
