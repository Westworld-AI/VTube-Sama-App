import {
  AdobeFirefly,
  Ai21,
  Aws,
  Azure,
  Baichuan,
  ByteDance,
  ChatGLM,
  Claude,
  Cohere,
  Dbrx,
  FishAudio,
  Gemini,
  Gemma,
  Hunyuan,
  LLaVA,
  Meta,
  Minimax,
  Mistral,
  Moonshot,
  OpenAI,
  OpenChat,
  OpenRouter,
  Perplexity,
  Rwkv,
  Spark,
  Stability,
  Tongyi,
  Wenxin,
  ZeroOne,
  Ollama,
  Zhipu
} from '@lobehub/icons';
import React from 'react';

interface ModelIconProps {
  model: string;
  size: number;
}

const ModelIcon: React.FC<ModelIconProps> = (
  {
    model,
    size
  }) => {
    if (!model) return;

    // currently supported models, maybe not in its own provider
    if (model.startsWith('openai')) return <OpenAI size={size}/>;
    if (model.startsWith('ollama')) return <Ollama size={size}/>;
    if (model.startsWith('zhipu')) return <Zhipu size={size}/>;
    if (model.startsWith('glm') || model.includes('chatglm')) return <ChatGLM size={size}/>;
    if (model.includes('claude')) return <Claude size={size}/>;
    if (model.includes('titan')) return <Aws size={size}/>;
    if (model.includes('llama')) return <Meta size={size}/>;
    if (model.includes('llava')) return <LLaVA size={size}/>;
    if (model.includes('gemini')) return <Gemini size={size}/>;
    if (model.includes('gemma')) return <Gemma.Simple size={size}/>;
    if (model.includes('moonshot')) return <Moonshot size={size}/>;
    if (model.includes('qwen')) return <Tongyi size={size}/>;
    if (model.includes('minmax')) return <Minimax size={size}/>;
    if (model.includes('mistral') || model.includes('mixtral')) return <Mistral size={size}/>;
    if (model.includes('pplx') || model.includes('sonar')) return <Perplexity size={size}/>;
    if (model.includes('yi-')) return <ZeroOne size={size}/>;
    if (model.startsWith('openrouter')) return <OpenRouter size={size}/>; // only for Cinematika and Auto
    if (model.startsWith('openchat')) return <OpenChat size={size}/>;
    if (model.includes('command')) return <Cohere size={size}/>;
    if (model.includes('dbrx')) return <Dbrx size={size}/>;


    // below: To be supported in providers, move up if supported
    if (model.includes('baichuan')) return <Baichuan size={size}/>;
    if (model.includes('rwkv')) return <Rwkv size={size}/>;
    if (model.includes('ernie')) return <Wenxin size={size}/>;
    if (model.includes('spark')) return <Spark size={size}/>;
    if (model.includes('hunyuan')) return <Hunyuan size={size}/>;
    // ref https://github.com/fishaudio/Bert-VITS2/blob/master/train_ms.py#L702
    if (model.startsWith('d_') || model.startsWith('g_') || model.startsWith('wd_'))
      return <FishAudio size={size}/>;
    if (model.includes('skylark')) return <ByteDance size={size}/>;

    if (
      model.includes('stable-diffusion') ||
      model.includes('stable-video') ||
      model.includes('stable-cascade') ||
      model.includes('sdxl') ||
      model.includes('stablelm') ||
      model.startsWith('stable-') ||
      model.startsWith('sd3')
    )
      return <Stability size={size}/>;

    if (model.includes('wizardlm')) return <Azure size={size}/>;
    if (model.includes('firefly')) return <AdobeFirefly size={size}/>;
    if (model.includes('jamba') || model.includes('j2-')) return <Ai21 size={size}/>;

    return <></>
  }
;

export default ModelIcon;
