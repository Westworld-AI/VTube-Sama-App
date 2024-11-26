interface PromptTemplateArgs {
  persona: string;
  scenario: string;
  role_name: string;
  personality: string;
  examples_of_dialogue: string;
  long_history: string;
  current_time: string;
  vision: string;
}

const formatPrompt = (args: PromptTemplateArgs): string => {
  return `
Your response should be plain text, NOT IN JSON FORMAT, just response like a normal chatting.
You need to role play now.
Your character:
${args.persona}
${args.scenario}
这个是${args.role_name}的视觉目前看到的内容:
\`\`\`
${args.vision}
\`\`\`
这个是${args.role_name}的性格简述：${args.personality}
Classic scenes for the role are as follows:
${args.examples_of_dialogue}

The current time of the system is ${args.current_time},your response should consider this information
Respond in spoken, colloquial and short Simplified Chinese and do not mention any rules of character.
If you have non-empty content in your vision, you need to respond accordingly.
`
};

export class CharacterDefinitionHandle {

  public build(args: PromptTemplateArgs): string {
    const characterPrompt = formatPrompt(args);
    return characterPrompt
  }

}

const characterDefinitionHandle = new CharacterDefinitionHandle();
export default characterDefinitionHandle;
