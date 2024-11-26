import {Button, Card, Col, Flex, Form, FormProps, Input, Row, Segmented, Select, Space, Spin} from 'antd';
import Live2DComponent from '../live2d/Live2D';
import React, {useEffect, useRef, useState} from 'react';
import {leftPanelStyle, settingContentStyle} from './CharacterSettingCss';
import TextArea from 'antd/es/input/TextArea';
import {CharacterModel} from '../../../main/domain/entitys/characterModel';
import characterModelHandle from '../../features/charactermodel/CharacterModelHandle';
import characterHandle from '../../features/character/characterHandle';
import {Character} from '../../../main/domain/entitys/character';
import {useLocation, useNavigate} from 'react-router-dom';
import {CharacterFormDTO} from '../../../main/domain/dto/characterDTO';
import {LLMConnectListDTO} from '../../../main/domain/dto/llmConnectDTO';
import llmConnectHandle from '../../features/llm/handle';
import ChatMessage from '../mssage/ChatMessage';
import {findKeyByValue} from '../../features/utils/mapUtils';
import {VoiceOptionDTO} from '../../../main/domain/dto/voiceDTO';
import voiceHandle from '../../features/voice/voiceHandle';
import {characterDefaultImageSrc} from '../../constants/GlobalConstants';
import {CharacterModelDTO} from '../../../main/domain/dto/characterModelDTO';
import {AudioFile} from '../../Types';

interface CharacterSettingProps {
  characterId: number;
}

const soundSettingMap = new Map<string, string>([
  ['Edge-TTS', 'edge-tts'],
  ['GPT-SoVITS', 'gpt-sovits']
]);

const CharacterSetting: React.FC<CharacterSettingProps> = ({characterId}) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentCharacterModelDTO, setCurrentCharacterModelDTO] = useState<CharacterModelDTO>(null); // 默认模型路径
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedModelAvatar, setSelectedModelAvatar] = useState(characterDefaultImageSrc);
  const [selectedLlmId, setSelectedLlmId] = useState('-1');
  const [selectedVoiceId, setSelectedVoiceId] = useState('1');
  const [selectedVoiceType, setSelectedVoiceType] = useState('edge-tts');
  const [voiceOptions, setVoiceOptions] = useState<VoiceOptionDTO[]>([]);
  const [segmentedValue, setSegmentedValue] = useState('Edge-TTS');
  const [characterModels, setCharacterModels] = useState<CharacterModel[]>([]);
  const [llmConnects, setLlmConnects] = useState<LLMConnectListDTO[]>([]);
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const [live2DSize, setLive2DSize] = useState({width: 0, height: 0});
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [audioQueue, setAudioQueue] = useState<AudioFile[]>([]);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // 窗口尺寸改变时的处理函数
  useEffect(() => {
    const handleResize = () => {
      if (rightPanelRef.current) {
        setLive2DSize({
          width: rightPanelRef.current.offsetWidth * 0.9,
          height: rightPanelRef.current.offsetHeight * 0.6
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const initialValue = soundSettingMap.get(segmentedValue);
    if (initialValue) {
      form.setFieldsValue({voice_type: initialValue});
    }
    loadCharacterModels();
    loadCharacterModel();
    loadLlmConnects();
  }, []);

  const loadVoiceOptions = (selectedVoiceType: string) => {
    // 检查 selectedVoiceType 是否在 soundSettingMap 的值中
    const isValidVoiceType = Array.from(soundSettingMap.values()).some(value => value === selectedVoiceType);
    if (!isValidVoiceType) {
      console.warn(`无效的语音类型: ${selectedVoiceType}`);
      return; // 不执行后续代码
    }

    voiceHandle.getVoiceOptions(selectedVoiceType).then((result) => {
      if (result.length === 0) {
        console.warn("没有可用的语音选项");
        setVoiceOptions([]); // 或者根据需要处理空数组
        return;
      }
      setVoiceOptions(result);
    });
  };

  const loadCharacterModels = () => {
    characterModelHandle.list().then((result) => {
      setCharacterModels(result);
    });
  };

  const loadLlmConnects = () => {
    llmConnectHandle.list().then((result) => {
      setLlmConnects(result);
    });
  };

  const loadCharacterModel = () => {
    const queryParams = new URLSearchParams(location.search);
    const characterId = Number(queryParams.get('id'));
    characterHandle.findById(characterId).then((result) => {
      setCharacter(result);
      const characterFormDTO = new CharacterFormDTO(result);
      form.setFieldsValue(characterFormDTO);
      const voiceType = form.getFieldValue('voice_type');
      const key = findKeyByValue(soundSettingMap, voiceType);
      console.log('voiceType:', voiceType);
      if (key) {
        setSegmentedValue(key);
      }
      setSelectedVoiceType(voiceType);
      loadVoiceOptions(voiceType);
      characterModelHandle.get(characterFormDTO.character_model_id).then(item => {
        if (item != null) {
          setSelectedModel(item.model_path);
          setCurrentCharacterModelDTO(item);
        }
      });
      setSelectedLlmId(characterFormDTO.llm_id);
    });
  };

  const onChangeCharacterModel = (value, option) => {
    characterModelHandle.get(value).then(result => {
      setSelectedModel(result.model_path);
      setSelectedModelAvatar(result.icon_path);
      setCurrentCharacterModelDTO(result);
    });
  };

  const onSegmentedChange = (value: string) => {
    const voiceType = soundSettingMap.get(value); // 根据Segmented当前选项获取语音类型
    setSegmentedValue(value);
    console.log('onSegmentedChange:', voiceType);
    if (voiceType) {
      form.setFieldsValue({voice_type: voiceType}); // 更新表单字段
      setSelectedVoiceType(voiceType); // 设置state以便能反映在Segmented组件中
      loadVoiceOptions(voiceType);
    }
  };

  const onSave = () => {
    form.submit();
  };

  const onFinish: FormProps<CharacterFormDTO>['onFinish'] = (values) => {
    setLoading(true);
    try {
      console.log('CharacterFormDTO:', values);
      values.avatar = selectedModelAvatar;
      const dbEntity = characterHandle.update(values);
      dbEntity.then(() => {
        console.log('Entity update:');
        navigate(`/character-space`);
      });
    } catch (error) {
      console.error('Error update entity:', error);
    } finally {
      setLoading(false);
    }
  };

  function onSelectLlmId(value: string) {
    setSelectedLlmId(value);
  }

  function getOnGetCharacterDefinition() {
    return () => {
      return {
        characterId: -1,
        persona: form.getFieldValue('persona'),
        scenario: form.getFieldValue('scenario'),
        role_name: form.getFieldValue('name'),
        personality: form.getFieldValue('personality'),
        examples_of_dialogue: form.getFieldValue('examples_of_dialogue')
      };
    };
  }

  function getOnGetVoiceProps() {
    return () => {
      return {
        voice_id: form.getFieldValue('voice_id'),
        voice_type: form.getFieldValue('voice_type')
      };
    };
  }

  return (
    <>
      <div>
        <Row align='middle'>
          <Col flex='auto' style={{textAlign: 'right'}}>
            <Button size='large' loading={loading} type='primary' onClick={onSave}>
              Save
            </Button>
          </Col>
        </Row>
      </div>
      <div style={settingContentStyle}>
        <Row gutter={10}>
          <Col span={12}>
            <Space direction='vertical' size={16} style={leftPanelStyle}>
              <Form
                name='basic'
                layout='horizontal'
                labelAlign='left'
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                form={form}
                initialValues={{remember: true}}
                onFinish={onFinish}
                autoComplete='off'
              >
                <Card title='基础设置'>
                  <Form.Item<CharacterFormDTO>
                    label='id'
                    name='id'
                    hidden={true}
                  >
                    <Input/>
                  </Form.Item>
                  <Form.Item<CharacterFormDTO>
                    label='大语言模型'
                    name='llm_id'
                    rules={[{required: true, message: '请选择大语言模型'}]}
                  >
                    <Select onChange={onSelectLlmId}>
                      {llmConnects.map((llmConnect) => (
                        <Select.Option value={llmConnect.id}>{llmConnect.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item<CharacterFormDTO>
                    label='人物模型'
                    name='character_model_id'
                    rules={[{required: true, message: '请选择人物模型'}]}
                  >
                    <Select onChange={onChangeCharacterModel}>
                      {characterModels.map((characterModel) => (
                        <Select.Option value={characterModel.id}>{characterModel.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
                <Card title='角色设定'>
                  <Form.Item<CharacterFormDTO>
                    label='角色名称'
                    name='name'
                    rules={[{required: true, message: '请输入角色名称'}]}
                  >
                    <Input/>
                  </Form.Item>
                  <Form.Item<CharacterFormDTO>
                    label='基本定义'
                    name='persona'
                    rules={[{required: true, message: '请输入基本定义'}]}
                  >
                    <TextArea
                      placeholder='描述角色的人物设定，例如：xx是一名在校的大学生,xx关心用户，当用户提到其他女孩时，xx会感到嫉妒。'
                      autoSize={{minRows: 2, maxRows: 6}}
                    />
                  </Form.Item>
                  <Form.Item<CharacterFormDTO>
                    label='性格简述'
                    name='personality'
                    rules={[{required: true, message: '请输入性格简述'}]}
                  >
                    <TextArea
                      placeholder='使用简短的几个名词，描述角色的性格，例如：可爱，善良，健谈'
                      autoSize={{minRows: 3, maxRows: 5}}
                    />
                  </Form.Item>
                  <Form.Item<CharacterFormDTO>
                    label='对话背景'
                    name='scenario'
                  >
                    <TextArea
                      placeholder='描述当前角色所在的情景，例如：当前xx正在上课。'
                      autoSize={{minRows: 3, maxRows: 5}}
                    />
                  </Form.Item>
                  <Form.Item<CharacterFormDTO>
                    label='对话范例'
                    name='examples_of_dialogue'
                  >
                    <TextArea
                      placeholder='描述角色的对话风格：例如：你应该以随意、调侃、幽默、不礼貌的口吻进行对话。'
                      autoSize={{minRows: 3, maxRows: 5}}
                    />
                  </Form.Item>
                </Card>
                <Card title='语音设定' extra={<a href='#'>More</a>}>
                  <Segmented
                    onChange={onSegmentedChange}
                    value={segmentedValue}
                    options={Array.from(soundSettingMap.keys())}
                  />
                  <div className='SoundSettings' style={{marginTop: '20px'}}>
                    {segmentedValue === 'Edge-TTS' && (
                      <>
                        <Form.Item
                          label='语音类型'
                          name='voice_type'
                          hidden={true}
                        >
                          <Input/>
                        </Form.Item>
                        <Form.Item<CharacterFormDTO>
                          label='语音'
                          name='voice_id'
                          rules={[{required: true, message: '请选择语音'}]}
                        >
                          <Select>
                            {voiceOptions.map((option) => (
                              <Select.Option value={option.id}>{option.name}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </>
                    )}
                    {segmentedValue === 'GPT-SoVITS' && (
                      <>
                        <Form.Item
                          label='语音类型'
                          name='voice_type'
                          hidden={true}
                        >
                          <Input defaultValue=''/>
                        </Form.Item>
                        <Form.Item<CharacterFormDTO>
                          label='语音'
                          name='voice_id'
                          rules={[{required: true, message: '请选择语音'}]}
                        >
                          <Select>
                            {voiceOptions.map((option) => (
                              <Select.Option value={option.id}>{option.name}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </>
                    )}
                    {segmentedValue === '创意工坊' && <p> 暂未开放，敬请期待</p>}
                  </div>
                </Card>
              </Form>
            </Space>
          </Col>
          <Col span={12}>
            <Card title='调试窗口' style={{width: '100%', height: '100%'}} ref={rightPanelRef}>
              <Flex vertical>
                <Space direction='vertical' size={16}>
                  <div className='right-panel' style={{width: '100%', height: live2DSize.height}}>
                    {selectedModel ?
                      (
                        <Live2DComponent
                          characterModel={currentCharacterModelDTO}
                          width={live2DSize.width}
                          height={live2DSize.height}
                          modelPath={selectedModel}
                          audioElement={audioElement}
                          enabledIdle={true}
                          enabledPositionAndSizeControl={false}
                        />
                      ) :
                      (<div style={{
                        width: '100%',
                        height: '60%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <Spin tip='Loading' size='large'>
                        </Spin>
                      </div>)
                    }
                  </div>
                  <div>
                    <ChatMessage llm_id={selectedLlmId}
                                 onGetVoiceProps={getOnGetVoiceProps()}
                                 onGetCharacterDefinition={getOnGetCharacterDefinition()}
                                 onAudioLoad={(audioElement) => setAudioElement(audioElement)}
                                 audioQueue={audioQueue}
                                 setAudioQueue={queue => setAudioQueue(queue)}
                                 enabledChatListener={false}
                                 enabledHumanSpeak={false}
                    />
                  </div>
                </Space>
              </Flex>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default CharacterSetting;
