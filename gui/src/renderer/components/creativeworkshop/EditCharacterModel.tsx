import { CharacterLive2DModelFromDTO, CharacterModelDTO } from '../../../main/domain/dto/characterModelDTO';
import {
  Button,
  Card,
  Col,
  Flex,
  Form, FormProps,
  Input,
  message,
  Row,
  Select,
  Space,
  Upload, UploadFile, GetProp, UploadProps
} from 'antd';
import { leftPanelStyle } from '../character/CharacterSettingCss';
import Live2DComponent from '../live2d/Live2D';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Live2dCharacterModel } from '../../features/charactermodel/live2d/Live2dModelLoader';
import characterModelHandle from '../../features/charactermodel/CharacterModelHandle';
import { AutoMapper } from '../../features/utils/AutoMapperUtils';

interface EditCharacterModelProps {
  characterModel: CharacterModelDTO;
  onSubmitFormCall: () => void;
}

const EditCharacterModel = forwardRef((props: EditCharacterModelProps, ref) => {

  const [live2DSize, setLive2DSize] = useState({ width: 0, height: 0 });
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [live2dCharacterModel, setLive2dCharacterModel] = useState<Live2dCharacterModel | null>(null);
  const [form] = Form.useForm();
  const [iconFileList, setIconFileList] = useState<UploadFile[]>([]);


  // 使用useImperativeHandle暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    submitForm() {
      form.submit();
    }
  }));

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

    // 加载model
    if (props.characterModel) {
      const characterModelDTO = AutoMapper.map(props.characterModel, CharacterModelDTO);
      const characterLive2DModelFromDTO = characterModelDTO.toFrom();
      form.setFieldsValue(characterLive2DModelFromDTO);
      setIconFileList([{
        uid: '-1',
        name: 'icon',
        status: 'done',
        url: characterLive2DModelFromDTO.icon_path
      }]);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onSelectDefinition = (value) => {
    console.log('onSelectDefinition:', value);
    if (live2dCharacterModel) {
      live2dCharacterModel.action(value);
    }
  };

  const onFinish: FormProps<CharacterLive2DModelFromDTO>['onFinish'] = (values) => {
    console.log('CharacterLive2DModelFromDTO:', values);
    const characterLive2DModelFromDTO = new CharacterLive2DModelFromDTO(
      values.id,
      values.name,
      values.category,
      values.type,
      values.icon_path,
      values.model_path,
      values.idles,
      values.lip_sync_id,
      values.expr_happy,
      values.expr_sad,
      values.expr_angry,
      values.expr_shy,
      values.expr_surprise,
      values.act_say_hello,
      values.act_act_cute
    );
    const characterModelDTO = characterLive2DModelFromDTO.toDTO();
    console.log('characterModelDTO:', characterModelDTO);
    characterModelHandle.update(characterModelDTO).then(res => {
      props.onSubmitFormCall();
    });
  };

  const handleUpload = (file: File) => {
    characterModelHandle.uploadImage(file.path).then((res) => {
      if (!res.isError) {
        message.success('上传头像成功');
        form.setFieldValue('icon_path', res.filePath);
      } else {
        message.error('上传头像失败');
      }
      console.log('image handleUpload:', res);
    });
  };

  const onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    console.log('fileList:', iconFileList);
    setIconFileList(newFileList);
  };

  return <div>
    <Row gutter={10}>
      <Col span={12} key='debugging'>
        <Card title='调试窗口' style={{ width: '100%', height: '100%' }} ref={rightPanelRef}>
          <Flex vertical>
            <Space direction='vertical' size={16}>
              <div className='right-panel' style={{ width: '100%', height: live2DSize.height }}>
                {props.characterModel && (
                  <Live2DComponent
                    characterModel={props.characterModel}
                    width={live2DSize.width}
                    height={live2DSize.height}
                    modelPath={props.characterModel.model_path}
                    audioElement={audioElement}
                    callbackLive2dCharacterModel={live2dCharacterModel => {
                      setLive2dCharacterModel(live2dCharacterModel);
                    }}
                    enabledIdle={false}
                    enabledPositionAndSizeControl={false}
                  />
                )}
              </div>
            </Space>
          </Flex>
        </Card>
      </Col>
      <Col span={12} key='settings'>
        <Space direction='vertical' size={16} style={{ ...leftPanelStyle, maxHeight: '100vh', overflowY: 'auto' }}>
          <Form
            name='basic'
            layout='horizontal'
            labelAlign='left'
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            form={form}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete='off'
          >
            <Card title='基础设置'>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='id'
                name='id'
                hidden={true}
              >
                <Input />
              </Form.Item>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='model_path'
                name='model_path'
                hidden={true}
              >
                <Input />
              </Form.Item>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='人物头像'
                name='icon_path'
              >
                <Upload
                  maxCount={1}
                  customRequest={({ file, onSuccess, onError }) => {
                    handleUpload(file as File);
                    onSuccess?.('ok');
                  }}
                  listType='picture-card'
                  fileList={iconFileList}
                  showUploadList={{
                    showPreviewIcon: false,
                    showRemoveIcon: true
                  }}
                  onChange={onChange}
                >
                  {iconFileList.length < 1 && '+ Upload'}
                </Upload>
              </Form.Item>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='角色名称'
                name='name'
                rules={[{ required: true, message: '请输入角色名称' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='闲置动画'
                name='idles'
              >
                <Select mode='multiple' onSelect={onSelectDefinition}>
                  {live2dCharacterModel && live2dCharacterModel.definitions.length > 0 && (
                    live2dCharacterModel.definitions.map((definition) => (
                      <Select.Option value={definition}>{definition}</Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='嘴唇同步'
                name='lip_sync_id'
                rules={[{ required: true, message: '请选择嘴唇同步参数' }]}
              >
                <Select>
                  {live2dCharacterModel && live2dCharacterModel.lipSyncIds.length > 0 && (
                    live2dCharacterModel.lipSyncIds.map((lipSyncId) => (
                      <Select.Option value={lipSyncId}>{lipSyncId}</Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>
            </Card>
            <Card title='表情动画设置'>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='高兴'
                name='expr_happy'
              >
                <Select onSelect={onSelectDefinition}>
                  {live2dCharacterModel && live2dCharacterModel.definitions.length > 0 && (
                    live2dCharacterModel.definitions.map((definition) => (
                      <Select.Option value={definition}>{definition}</Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='难过'
                name='expr_sad'
              >
                <Select onSelect={onSelectDefinition}>
                  {live2dCharacterModel && live2dCharacterModel.definitions.length > 0 && (
                    live2dCharacterModel.definitions.map((definition) => (
                      <Select.Option value={definition}>{definition}</Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='生气'
                name='expr_angry'
              >
                <Select onSelect={onSelectDefinition}>
                  {live2dCharacterModel && live2dCharacterModel.definitions.length > 0 && (
                    live2dCharacterModel.definitions.map((definition) => (
                      <Select.Option value={definition}>{definition}</Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='害羞'
                name='expr_shy'
              >
                <Select onSelect={onSelectDefinition}>
                  {live2dCharacterModel && live2dCharacterModel.definitions.length > 0 && (
                    live2dCharacterModel.definitions.map((definition) => (
                      <Select.Option value={definition}>{definition}</Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='惊讶'
                name='expr_surprise'
              >
                <Select onSelect={onSelectDefinition}>
                  {live2dCharacterModel && live2dCharacterModel.definitions.length > 0 && (
                    live2dCharacterModel.definitions.map((definition) => (
                      <Select.Option value={definition}>{definition}</Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>
            </Card>
            <Card title='行为动画设置'>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='打招呼'
                name='act_say_hello'
              >
                <Select onSelect={onSelectDefinition}>
                  {live2dCharacterModel && live2dCharacterModel.definitions.length > 0 && (
                    live2dCharacterModel.definitions.map((definition) => (
                      <Select.Option value={definition}>{definition}</Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>
              <Form.Item<CharacterLive2DModelFromDTO>
                label='卖萌'
                name='act_act_cute'
              >
                <Select onSelect={onSelectDefinition}>
                  {live2dCharacterModel && live2dCharacterModel.definitions.length > 0 && (
                    live2dCharacterModel.definitions.map((definition) => (
                      <Select.Option value={definition}>{definition}</Select.Option>
                    ))
                  )}
                </Select>
              </Form.Item>
            </Card>
            {/*<Card title='自定义设置'>*/}
            {/*  <Form.Item<CharacterFormDTO>*/}
            {/*    label='打招呼'*/}
            {/*    name='llm_id'*/}
            {/*    rules={[{ required: true, message: '请选择闲置动画' }]}*/}
            {/*  >*/}
            {/*    <Select>*/}
            {/*    </Select>*/}
            {/*  </Form.Item>*/}
            {/*  <Form.Item<CharacterFormDTO>*/}
            {/*    label='卖萌'*/}
            {/*    name='llm_id'*/}
            {/*    rules={[{ required: true, message: '请选择闲置动画' }]}*/}
            {/*  >*/}
            {/*    <Select>*/}
            {/*    </Select>*/}
            {/*  </Form.Item>*/}
            {/*</Card>*/}
          </Form>
        </Space>
      </Col>
    </Row>
  </div>;
});

export default EditCharacterModel;
