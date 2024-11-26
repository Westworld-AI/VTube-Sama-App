import Live2DComponent from '../live2d/Live2D';
import React, {useEffect, useRef, useState} from 'react';
import characterModelHandle from '../../features/charactermodel/CharacterModelHandle';
import systemSettingHandle from '../../features/system/systemSettingHandle';
import characterHandle from '../../features/character/characterHandle';
import {CharacterDTO} from '../../../main/domain/dto/characterDTO';
import {HomeSettingDTO, LiveSettingDTO, SystemSettingDTO} from '../../../main/domain/dto/systemSettingDTO';
import liveClienHandle from '../../features/live/LiveClienHandle';
import ChatMessage from '../mssage/ChatMessage';
import Background from '../common/background/Background';
import {CharacterModelDTO} from '../../../main/domain/dto/characterModelDTO';
import ScrollingTextDisplay from '../common/text/ScrollingTextDisplay';
import {Subject} from 'rxjs';
import {AudioFile} from '../../Types';
import {Live2dCharacterModel} from '../../features/charactermodel/live2d/Live2dModelLoader';


const modelViewDiv = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1
};

const LiveView: React.FC = () => {

  const [live2DSize, setLive2DSize] = useState({width: 0, height: 0});
  const [currentModelPath, setCurrentModelPath] = useState(null); // 默认模型路径
  const [currentCharacterModelDTO, setCurrentCharacterModelDTO] = useState<CharacterModelDTO>(null); // 默认模型路径
  const [currentLlmId, setCurrentLlmId] = useState('-1');
  const [currentCharacterDTO, setCurrentCharacterDTO] = useState<CharacterDTO | null>(null);
  const [currentSystemSettingDTO, setCurrentSystemSettingDTO] = useState<SystemSettingDTO | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentBackground, setCurrentBackground] = useState('assets/background/School01.jpg');
  const [currentLiveSettingDTO, setCurrentLiveSettingDTO] = useState<LiveSettingDTO | null>(null);
  const [live2dCharacterModel, setLive2dCharacterModel] = useState<Live2dCharacterModel | null>(null);
  const [audioQueue, setAudioQueue] = useState<AudioFile[]>([]);
  const chatStream = useRef(new Subject<string>());

  useEffect(() => {
    const handleMessageFromMain = (message) => {
      if (message.type === 'system') {
        loaderSystemSetting();
      }
    };
    window.electron.ipcRenderer.on('message-from-main', handleMessageFromMain);
    return () => {
      window.electron.ipcRenderer.removeListener('message-from-main', handleMessageFromMain);
    };
  }, []);

  useEffect(() => {
    systemSettingHandle.getSystemSetting().then(systemSettingDTO => {
      if (systemSettingDTO) {
        const homeSetting: HomeSettingDTO = systemSettingDTO.home_setting;
        const liveSettingDTO: LiveSettingDTO = systemSettingDTO.live_setting[homeSetting.live_client];
        if (liveSettingDTO && liveSettingDTO.enabled) {
          liveClienHandle.shutdown().then(() => {
            liveClienHandle.start(liveSettingDTO).then(() => {
              window.messageApi.ipcRenderer.sendMessageToChildWindows({
                type: 'humanSpeak',
                data: '哈喽，哈喽'
              });
            }).catch(() => {
              window.messageApi.ipcRenderer.sendMessageToChildWindows({
                type: 'humanSpeak',
                data: '弹幕监听连接失败，请关闭直播窗口，重新打开，进行重试！'
              });
            });
          });
        }
      }
    });
  }, []);

  // TOOD 可以封装
  useEffect(() => {
    return live2dResize();
  }, []);

  useEffect(() => {
    loaderSystemSetting();
  }, []);

  useEffect(() => {
    if (currentCharacterDTO) {
      setCurrentLlmId(currentCharacterDTO.basic_setting['llm_id']);
      characterModelHandle.get(currentCharacterDTO.basic_setting['character_model_id']).then(characterModel => {
        setCurrentModelPath(characterModel.model_path);
        setCurrentCharacterModelDTO(characterModel);
      });
    }
  }, [currentCharacterDTO]);

  function loaderSystemSetting() {
    systemSettingHandle.getSystemSetting().then(systemSettingDTO => {
      if (systemSettingDTO) {
        setCurrentSystemSettingDTO(systemSettingDTO);
        const homeSetting: HomeSettingDTO = systemSettingDTO.home_setting;
        setCurrentBackground(homeSetting.background_src);
        characterHandle.findById(Number(homeSetting.character_id)).then(characterDTO => {
          setCurrentCharacterDTO(characterDTO);
        });
      } else {
        console.log('not systemSetting');
      }
    });
  }

  const onGetCharacterDefinition =
    () => {
      if (currentCharacterDTO) {
        const definition_setting = currentCharacterDTO?.definition_setting;
        definition_setting['characterId'] = currentCharacterDTO.id;
        return definition_setting;
      } else {
        return null;
      }
    };

  const onGetVoiceProps = () => {
    if (currentCharacterDTO) {
      return currentCharacterDTO?.voice_setting;
    } else {
      return {
        'voice_id': 'zh-CN-XiaoyiNeural',
        'voice_type': 'edge-tts'
      };
    }
  };

  function live2dResize() {
    // 窗口尺寸改变时的处理函数
    const handleResize = () => {
      // 设置 Live2D 渲染尺寸为窗口宽度的50%和高度的70%
      setLive2DSize({
        width: window.innerWidth * 1,
        height: window.innerHeight * 1
      });
    };
    // 初始化尺寸
    handleResize();
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
    // 清理监听器
    return () => window.removeEventListener('resize', handleResize);
  }

  return (
    <div>
      <div
        className='fixed top-0 left-0 w-full h-16 flex items-center justify-center z-20 webkit-app-region-drag'>
      </div>
      <Background imageSrc={currentBackground}/>
      <div style={modelViewDiv}>
        {currentModelPath && (
          <Live2DComponent
            width={live2DSize.width}
            height={live2DSize.height}
            characterModel={currentCharacterModelDTO}
            modelPath={currentModelPath}
            audioElement={audioElement}
            enabledIdle={true}
            callbackLive2dCharacterModel={live2dCharacterModel => setLive2dCharacterModel(live2dCharacterModel)}
            enabledPositionAndSizeControl={true}
          />
        )}
        <div className='fixed w-4/5 top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'>
          <ScrollingTextDisplay chatStream={chatStream}/>
        </div>
        <div className='home-scrollContainer' hidden={true}>
          <ChatMessage llm_id={currentLlmId}
                       onGetVoiceProps={onGetVoiceProps}
                       onGetCharacterDefinition={onGetCharacterDefinition}
                       onAudioLoad={(audioElement) => setAudioElement(audioElement)}
                       audioQueue={audioQueue}
                       setAudioQueue={queue => setAudioQueue(queue)}
                       enabledChatListener={true}
                       enabledHumanSpeak={false}
                       chatStream={chatStream.current}
          />
        </div>
      </div>
    </div>
  )
    ;
};

export default LiveView;
