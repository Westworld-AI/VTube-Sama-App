import React, {useEffect, useRef, useState} from 'react';
import Search from 'antd/es/input/Search';
import {LLMResult} from '../../features/llm/base';
import {AudioOutlined} from '@ant-design/icons';
import {Subject} from 'rxjs';
import voiceHandle, {TextSegmentation} from '../../features/voice/voiceHandle';
import AudioPlayerQueue from './AudioPlayerQueue';
import agentHandle from '../../features/agent/AgentHandle';
import {chatTaskPriorityQueue} from '../../features/utils/Queue';
import {AudioFile} from '../../Types';
import {Live2dCharacterModel} from '../../features/charactermodel/live2d/Live2dModelLoader';
import {CharacterModelDTO} from '../../../main/domain/dto/characterModelDTO';
import {createModel, KaldiRecognizer} from 'vosk-browser';
import {useMicVAD} from '@ricky0123/vad-react';
import {defaultVoskModel} from '../../constants/GlobalConstants';

interface ChatMessageProps {
  llm_id: string;
  onGetVoiceProps: () => VoiceProps;
  onGetCharacterDefinition: () => CharacterDefinitionProps;
  onAudioLoad: (audioElement: HTMLAudioElement) => void;
  audioQueue: AudioFile[];
  setAudioQueue: (audio: any) => void;
  enabledChatListener: boolean;
  enabledHumanSpeak: boolean;
  chatStream?: Subject<string>;
  live2dCharacterModel?: Live2dCharacterModel;
}


interface VoiceProps {
  voice_type: string;
  voice_id: string;
}

interface CharacterDefinitionProps {
  characterId: number;
  persona: string;
  scenario: string;
  role_name: string;
  personality: string;
  examples_of_dialogue: string;
}

const ChatMessage: React.FC<ChatMessageProps> = (
  {
    llm_id,
    onGetVoiceProps,
    onGetCharacterDefinition,
    onAudioLoad,
    audioQueue,
    setAudioQueue,
    enabledChatListener,
    enabledHumanSpeak,
    chatStream,
    live2dCharacterModel
  }) => {
  const [chatLoading, setChatLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const llmIdRef = useRef<string>(llm_id);
  const characterDefinitionRef = useRef<CharacterDefinitionProps>(onGetCharacterDefinition());
  const voiceRef = useRef<VoiceProps>(onGetVoiceProps());
  const [isVoiceRecognitionActive, setIsVoiceRecognitionActive] = useState(false);
  const isVoiceRecognitionActiveRef = useRef(isVoiceRecognitionActive); // 添加这个引用
  const recognizerRef = useRef<KaldiRecognizer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognizerNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // 当llm_id发生变化时，更新llmIdRef的值
  useEffect(() => {
    llmIdRef.current = llm_id;
    characterDefinitionRef.current = onGetCharacterDefinition();
    voiceRef.current = onGetVoiceProps();
  }, [llm_id, onGetCharacterDefinition, voiceRef]);

  if (enabledChatListener) {

    const vad = useMicVAD({
      startOnLoad: true,
      onSpeechEnd: (audio) => {
        console.log('User stopped talking');
        if (!isVoiceRecognitionActiveRef.current) return;
        recognizerRef.current?.acceptWaveformFloat(audio, 16000);
        recognizerRef.current?.retrieveFinalResult();
        console.log('speek');
      }
    });

    // 初始化语音识别模型，仅在组件加载时执行一次
    useEffect(() => {
      const loadModel = async () => {
        try {
          const voskModelPath = await window.electronAPI.getVoskModelPath(defaultVoskModel);
          console.log('load vosk model:', voskModelPath);
          const model = await createModel(voskModelPath);
          console.log(' vosk model:', model);
          const recognizer = new model.KaldiRecognizer(48000);
          recognizerRef.current = recognizer;
          recognizer.on('result', (message) => {
            const text = message?.result?.text;
            console.log(`Speech Result:`, text);
            // 使用trim()去除可能的空白字符，并检查是否有实际数据
            if (text && text.trim().length > 0) {
              chatTaskPriorityQueue.enqueue(async () => await onChat(text.trim(), 'yakami'), 1);
            }
          });
          recognizer.on('error', (message) => {
            console.log(`error:`, message);
          });
        } catch (error) {
          console.error('加载模型失败:', error);
        }
      };
      loadModel();
    }, []);

    useEffect(() => {
      isVoiceRecognitionActiveRef.current = isVoiceRecognitionActive;
    }, [isVoiceRecognitionActive]);

    // 关闭语音识别
    const disableVoiceRecognition = () => {
      recognizerNodeRef.current?.disconnect();
      sourceRef.current?.disconnect();
      audioContextRef.current?.close();
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      recognizerNodeRef.current = null;
      sourceRef.current = null;
      audioContextRef.current = null;
      mediaStreamRef.current = null;
    };

    // 封装检查按键组合的逻辑
    const isCorrectKeyCombination = (event: KeyboardEvent) => {
      console.log('platform:', navigator.platform.toUpperCase());
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const correctKey = event.key === 'x';
      const correctModifier = isMac ? event.metaKey : event.altKey;
      return correctKey && correctModifier;
    };

    // 处理快捷键开启/关闭语音识别
    useEffect(() => {
      const handleKeyDown = async (event: KeyboardEvent) => {
        if (isCorrectKeyCombination(event)) {
          if (!isVoiceRecognitionActiveRef.current) {
            setIsVoiceRecognitionActive(true);
            console.log('Open Speech');
          } else {
            disableVoiceRecognition();
            setIsVoiceRecognitionActive(false);
            console.log('Open Close');
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, []);

    useEffect(() => {
      console.log('load ChatListener');
      // 监听弹幕消息
      const handleMessageFromMain = (message) => {
        if (message.type === 'control') {
          const controlMessage = message.data;
          console.log('control message:', controlMessage);
          if (controlMessage.type === 'chat') {
            const content = controlMessage.data.content;
            chatTaskPriorityQueue.enqueue(async () => await onChat(content, controlMessage.data.user_name), 1);
          } else if (controlMessage.type === 'action') {
            chatTaskPriorityQueue.enqueue(async () => await onAction(controlMessage, null), 1);
          }
        } else if (message.type === 'humanSpeak') {
          const content = message.data;
          console.log('humanSpeak message:', content);
          chatTaskPriorityQueue.enqueue(async () => await onHumanChat(content), 1);
        }
      };
      window.electron.ipcRenderer.on('message-from-main', handleMessageFromMain);
      return () => {
        window.electron.ipcRenderer.removeListener('message-from-main', handleMessageFromMain);
      };
    }, []);
  }

  const suffix = (
    <AudioOutlined
      style={{
        fontSize: 16,
        color: '#1677ff'
      }}
    />
  );

  const onChat = async (value: string, username: string) => {

    setChatLoading(true);
    setSearchValue(''); // 将搜索值清空
    const textSegmentation = new TextSegmentation();
    const characterDefinitionProps = characterDefinitionRef.current;
    await agentHandle.chat({
      messageSource: 'client',
      sender: username,
      query: value,
      llm_id: llmIdRef.current,
      characterId: characterDefinitionProps.characterId,
      persona: characterDefinitionProps.persona,
      scenario: characterDefinitionProps.scenario,
      role_name: characterDefinitionProps.role_name,
      personality: characterDefinitionProps.personality,
      examples_of_dialogue: characterDefinitionProps.examples_of_dialogue,
      callback: (llmResult: LLMResult) => {
        textToSpeech(characterDefinitionProps, textSegmentation, llmResult);
        if (llmResult.done) {
          setChatLoading(false);
        }
      }
    });

    const textToSpeech = (characterDefinitionProps: CharacterDefinitionProps, textSegmentation: TextSegmentation, llmResult: LLMResult) => {
      textSegmentation.add(llmResult.output);
      const voiceProps = voiceRef.current;

      function clearRoleName(text: string) {
        const roleName = characterDefinitionProps.role_name;
        // 动作列表，可以根据需要添加更多
        const actions = ['说', ':', '：'];
        // 使用 map 将每个动作转换为正则表达式的一部分，然后用 | 连接
        const actionsPattern = actions.map(action => `\\${action}`).join('|');
        // 构建正则表达式，动态插入动作模式
        const regex = new RegExp(`^${roleName}\\s*(${actionsPattern})\\s*`);
        return text.replace(regex, '');
      }

      if (textSegmentation.isDone() || llmResult.done) {
        let text = textSegmentation.output();
        // 使用正则表达式去除[xx]和（xx）
        text = text.replace(/\[.*?\]|\（.*?\）/g, '');
        text = clearRoleName(text);
        textSegmentation.clear();
        voiceHandle.synthesis(voiceProps.voice_type, voiceProps.voice_id, text, new Map<string, string>()).then((fileName) => {
          const voice_url = 'mediafile://' + fileName;
          const audioFile: AudioFile = {
            content: text,
            url: voice_url
          };
          setAudioQueue(queue => [...queue, audioFile]);
        });
      }
    };
  };

  const onAction = async (controlMessage, currentCharacterModelDTO: CharacterModelDTO) => {
    const content = controlMessage.data.content;
    const action = controlMessage.data.attribute?.action;
    // console.log('currentCharacterModelDTO:', currentCharacterModelDTO);
    // const actionCmd = currentCharacterModelDTO.action_mapping[action];
    // console.log('action:', actionCmd);
    addAudioFile(content, null);
  };

  function addAudioFile(value: string, action: string | null) {
    const voiceProps = voiceRef.current;
    voiceHandle.synthesis(voiceProps.voice_type, voiceProps.voice_id, value, new Map<string, string>()).then((fileName) => {
      const voice_url = 'mediafile://' + fileName;
      const audioFile: AudioFile = {
        content: value,
        url: voice_url,
        action: action
      };
      setAudioQueue(queue => [...queue, audioFile]);
    });
  }

  const onHumanChat = async (value: string) => {
    addAudioFile(value, null);
  };

  const onHumanSpeak = async (value: string, event) => {
    setChatLoading(true);
    setSearchValue('');
    window.messageApi.ipcRenderer.sendMessageToChildWindows({
      type: 'humanSpeak',
      data: value
    });
    setChatLoading(false);
  };

  function startSpeak(audioFile: AudioFile, audioElement: HTMLAudioElement) {

    if (chatStream) {
      // 将audioFile.content的每个字符逐个间隔50毫秒发送
      const content = audioFile.content;
      let index = 0; // 开始的字符索引
      // 定义一个函数用于发送字符并递归调用自己直到所有字符都被发送
      const sendChar = () => {
        if (index < content.length) {
          const char = content.charAt(index);
          chatStream.next(char); // 发送当前字符
          index++; // 移动到下一个字符
          setTimeout(sendChar, 80);
        }
      };
      sendChar(); // 开始发送字符
    }

    if (live2dCharacterModel) {
      live2dCharacterModel.immediatelyAction(audioFile.action);
    }

    onAudioLoad(audioElement);
  }

  function endSpeak() {
    setAudioQueue((queue) => {
      if (chatStream) {
        chatStream.next('[DONE]');
      }
      if (!queue.length) return [];
      const newQueue = queue.slice(1);
      return newQueue;
    });
  }

  return <>
    {!enabledChatListener && (
      <Search
        loading={chatLoading}
        value={searchValue}
        placeholder={enabledHumanSpeak ? '【直播模式】请输入你想让AI说的话' : '请输入你的聊天内容'}
        enterButton='Chat'
        size='large'
        onChange={(e) => setSearchValue(e.target.value)}
        onSearch={(value => {
          if (enabledHumanSpeak) {
            onHumanSpeak(value, null);
          } else {
            onChat(value, 'yakami');
          }
        })}
      />
    )}
    <AudioPlayerQueue queue={audioQueue}
                      onEnd={() => {
                        endSpeak();
                      }}
                      onAudioLoad={(audioElement, audioFile) => {
                        startSpeak(audioFile, audioElement);
                      }}
    />
  </>;
};

export default ChatMessage;
