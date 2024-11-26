import React, { useEffect } from 'react';
import { Card, Form, Input, Select, Switch } from 'antd';
import { liveClientOptions } from '../../constants/OptionConstants';

interface HomeLiveSettingProps {
  currentLiveClient: string;
  setLiveClient: (liveClient: string) => void;
}

const HomeLiveSetting: React.FC<HomeLiveSettingProps> = ({ currentLiveClient, setLiveClient }) => {

  const [form] = Form.useForm();

  useEffect(() => {

    form.setFieldValue('live_client', currentLiveClient);
  }, []);

  const onLiveClientChange = (value: string) => {
    setLiveClient(value);
  };

  return (
    <div className='bg-transparent'>
      <Form
        name='basic'
        layout='horizontal'
        labelAlign='left'
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        autoComplete='off'
        form={form}
      >
        <Card title='直播设置' className='bg-white bg-opacity-90'>
          <Form.Item
            label='id'
            name='id'
            hidden={true}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='直播平台'
            name='live_client'
            rules={[{ required: true, message: '请选择直播平台' }]}
          >
            <Select onChange={onLiveClientChange}>
              {liveClientOptions.map((item) => (
                <Select.Option value={item.id}>{item.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          {/*<Form.Item<CharacterFormDTO>*/}
          {/*  label='弹幕回复策略'*/}
          {/*  name='enabled_say_hello'*/}
          {/*  rules={[{ required: true, message: '请选择弹幕回复策略' }]}*/}
          {/*>*/}
          {/*  <Select>*/}
          {/*  </Select>*/}
          {/*</Form.Item>*/}
          {/*<Form.Item*/}
          {/*  label='开启打招呼'*/}
          {/*  name='enabled_say_hello'*/}
          {/*  rules={[{ required: true, message: '是否开启进入直播间欢迎' }]}*/}
          {/*>*/}
          {/*  <Switch checkedChildren='开启' unCheckedChildren='关闭' defaultChecked />*/}
          {/*</Form.Item>*/}
        </Card>
      </Form>
    </div>
  );
};

export default HomeLiveSetting;
