import Live2DComponent from '../components/live2d/Live2D';
import React, {useEffect, useRef, useState} from 'react';
import {Button, FloatButton, Space, Tooltip} from 'antd';
import {SettingOutlined, VideoCameraOutlined} from '@ant-design/icons';
import CharacterCardMenu from '../components/character/CharacterCardMenu';
import ChatMessage from '../components/mssage/ChatMessage';
import {SystemSettingDTO} from '../../main/domain/dto/systemSettingDTO';
import systemSettingHandle from '../features/system/systemSettingHandle';
import {CharacterDTO} from '../../main/domain/dto/characterDTO';
import characterModelHandle from '../features/charactermodel/CharacterModelHandle';
import characterHandle from '../features/character/characterHandle';
import HomeLiveSetting from '../components/home/HomeLiveSetting';
import HomeOtherSetting from '../components/home/HomeOtherSetting';
import {BackgroundOption, builtInBackgroundOptions} from '../constants/OptionConstants';
import Background from '../components/common/background/Background';
import {CharacterModelDTO} from '../../main/domain/dto/characterModelDTO';
import ScrollingTextDisplay from '../components/common/text/ScrollingTextDisplay';
import {Subject} from 'rxjs';
import {AudioFile} from '../Types';
import {FaRegStopCircle} from 'react-icons/fa';
import {motion} from 'framer-motion'; // 添加导入


const homeRightMenuDiv = {
  top: 100,
  width: '360px',
  marginRight: '30px'
};

const modelViewDiv = {
  position: 'absolute',
  top: 20,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1
};

const Home = () => {

  const [currentModelPath, setCurrentModelPath] = useState(null); // 默认模型路径
  const [currentCharacterModelDTO, setCurrentCharacterModelDTO] = useState<CharacterModelDTO>(null); // 默认模型路径
  const [currentLlmId, setCurrentLlmId] = useState('-1');
  const [currentCharacterDTO, setCurrentCharacterDTO] = useState<CharacterDTO | null>(null);
  const [currentSystemSettingDTO, setCurrentSystemSettingDTO] = useState<SystemSettingDTO | null>(null);
  const [showScrollContainer, setShowScrollContainer] = useState(false); // 新状态，用来控制scrollContainer的显示和隐藏
  const [live2DSize, setLive2DSize] = useState({width: 0, height: 0});
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [audioQueue, setAudioQueue] = useState<AudioFile[]>([]);
  const [currentBackground, setCurrentBackground] = useState('assets/background/School01.jpg');
  const [backgroundOption, setBackgroundOption] = useState<BackgroundOption[]>([]);
  const [currentLiveClient, setCurrentLiveClient] = useState('');
  const [enabledHumanSpeak, setEnabledHumanSpeak] = useState<boolean>(false);
  const [disableLiveButton, setDisableLiveButton] = useState<boolean>(false);
  const [isCharacterModelLoading, setIsCharacterModelLoading] = useState<boolean>(false);

  const chatStream = useRef(new Subject<string>());


  useEffect(() => {
    return live2dResize();
  }, []);

  useEffect(() => {
    if (currentCharacterDTO) {
      setCurrentLlmId(currentCharacterDTO.basic_setting['llm_id']);
      characterModelHandle.get(currentCharacterDTO.basic_setting['character_model_id']).then(characterModel => {
        setCurrentCharacterModelDTO(characterModel);
        setCurrentModelPath(characterModel.model_path);
      });
    }
  }, [currentCharacterDTO]);

  const loaderBackgroundOption = () => {
    setBackgroundOption(builtInBackgroundOptions);
  };

  function loaderSystemSetting() {
    systemSettingHandle.getSystemSetting().then(systemSettingDTO => {
      if (systemSettingDTO) {
        setCurrentSystemSettingDTO(systemSettingDTO);
        setCurrentBackground(systemSettingDTO.home_setting?.background_src);
        setCurrentLiveClient(systemSettingDTO.home_setting?.live_client);
        characterHandle.findById(systemSettingDTO.home_setting?.character_id).then(characterDTO => {
          setCurrentCharacterDTO(characterDTO);
        });
      } else {
        console.log('not systemSetting');
      }
    });
  }

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

  const onSettingsClick = () => {
    setShowScrollContainer(!showScrollContainer); // 点击时切换状态
  };

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
      return null;
    }
  };

  const onSetCharacterDTO = (characterDTO: CharacterDTO) => {
    if (isCharacterModelLoading) {
      return
    }
    setIsCharacterModelLoading(true);
    setCurrentModelPath(null); // 先清空模型路径以触发动画
    setTimeout(() => {
      setCurrentCharacterDTO(characterDTO);
      let systemSettingDTO = currentSystemSettingDTO;
      // if (!systemSettingDTO) {
      //   systemSettingDTO = new SystemSettingDTO();
      //   systemSettingDTO.home_setting = new HomeSettingDTO(currentCharacterDTO?.id, '');
      // }
      if (systemSettingDTO.home_setting) {
        systemSettingDTO.home_setting.character_id = characterDTO ? characterDTO.id : undefined;
      }
      systemSettingHandle.createAndUpdateSystemSetting(systemSettingDTO).then(() => {
        setCurrentSystemSettingDTO(systemSettingDTO);
        notifyChildWindows();
        setIsCharacterModelLoading(false);
      });
    }, 200); // 动画持续时间
  };

  useEffect(() => {
    loaderSystemSetting();
    loaderBackgroundOption();
    const receiveCloseNewWindowEvent = (message) => {
      console.log('Home receiveCloseNewWindowEvent:', message);
      setEnabledHumanSpeak(false);
      setDisableLiveButton(false);
    };
    window.electron.ipcRenderer.on('closeNewWindow', receiveCloseNewWindowEvent);
    return () => {
      window.electron.ipcRenderer.removeAllListeners('closeNewWindow', receiveCloseNewWindowEvent);
    };
  }, []);

  const openLiveWindow = () => {
    if (disableLiveButton) {
      return;
    }
    setEnabledHumanSpeak(true);
    setDisableLiveButton(true);
    window.electron.ipcRenderer.invokeOpenNewWindow('open-new-window', 'an-argument');
  };

  const notifyChildWindows = () => {
    window.messageApi.ipcRenderer.sendMessageToChildWindows({
      type: 'system',
      message: 'update system sttings'
    });
  };

  const saveBackground = (backgroundSrc: string) => {
    let systemSettingDTO = currentSystemSettingDTO;
    if (systemSettingDTO?.home_setting) {
      systemSettingDTO.home_setting.background_src = backgroundSrc;
      systemSettingHandle.createAndUpdateSystemSetting(systemSettingDTO).then(() => {
        setCurrentSystemSettingDTO(systemSettingDTO);
        notifyChildWindows();
      });
    }
  };

  const saveLiveClient = (liveClient: string) => {
    let systemSettingDTO = currentSystemSettingDTO;
    if (systemSettingDTO?.home_setting) {
      systemSettingDTO.home_setting.live_client = liveClient;
      systemSettingHandle.createAndUpdateSystemSetting(systemSettingDTO).then(() => {
        setCurrentSystemSettingDTO(systemSettingDTO);
        notifyChildWindows();
      });
    }
  };


  return (
    <div className='relative w-full min-h-screen'>
      <Background imageSrc={currentBackground}/>
      <div className='absolute top-10 left-10 flex flex-row space-x-2 z-10 mt-16'>
        <Tooltip placement='topLeft' title='设置'>
          <Button
            className="mr-6"
            type='primary'
            shape='circle'
            size='large'
            icon={<SettingOutlined/>}
            onClick={onSettingsClick}
          />
        </Tooltip>
        <Tooltip placement='topLeft' title='点击开启直播'>
          <Button
            type='primary'
            shape='circle'
            size='large'
            icon={disableLiveButton ? <FaRegStopCircle/> : <VideoCameraOutlined/>}
            onClick={openLiveWindow}
            danger={disableLiveButton}
          />
        </Tooltip>
      </div>
      <div className='home-right-menu'>
        {showScrollContainer && (
          <div style={homeRightMenuDiv}>
            <Space direction='vertical' size='middle' style={{display: 'flex'}}>
              <HomeLiveSetting
                currentLiveClient={currentLiveClient}
                setLiveClient={liveClient => {
                  setCurrentLiveClient(liveClient);
                  saveLiveClient(liveClient);
                }}
              />
              <HomeOtherSetting
                currentBackground={currentBackground}
                backgroundOption={backgroundOption}
                setBackground={backgroundSrc => {
                  setCurrentBackground(backgroundSrc);
                  saveBackground(backgroundSrc);
                }}/>
            </Space>
          </div>
        )}
      </div>

      <div style={modelViewDiv}>
        {currentModelPath && (
          <motion.div
            initial={{x: '-100vw'}} // 从窗口最左侧开始
            animate={{x: 0}} // 动画结束位置
            transition={{duration: 0.5}} // 动画持续时间
          >
            <Live2DComponent
              width={live2DSize.width}
              height={live2DSize.height}
              characterModel={currentCharacterModelDTO}
              modelPath={currentModelPath}
              audioElement={audioElement}
              enabledIdle={true}
              enabledPositionAndSizeControl={false}
            />
          </motion.div>
        )}
      </div>

      {showScrollContainer && ( // 只有当showScrollContainer为true时，才显示scrollContainer内容
        <CharacterCardMenu onSetCharacterDTO={onSetCharacterDTO}/>
      )}

      <div className='fixed w-4/5 top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'>
        <ScrollingTextDisplay chatStream={chatStream}/>
      </div>
      {!showScrollContainer && ( // 只有当showScrollContainer为true时，才显示scrollContainer内容
        <div className='home-scrollContainer'>
          <ChatMessage llm_id={currentLlmId}
                       onGetVoiceProps={onGetVoiceProps}
                       onGetCharacterDefinition={onGetCharacterDefinition}
                       onAudioLoad={(audioElement) => setAudioElement(audioElement)}
                       audioQueue={audioQueue}
                       setAudioQueue={queue => setAudioQueue(queue)}
                       enabledChatListener={false}
                       enabledHumanSpeak={enabledHumanSpeak}
                       chatStream={chatStream.current}
          />
        </div>
      )}
    </div>
  );
};


export default Home;
