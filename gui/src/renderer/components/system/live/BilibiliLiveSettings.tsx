import {
  Form,
  Input,
  Select,
  SelectProps
} from 'antd';
import FormLabel from '../../common/label/FormLabel';
import LLMConnectivityCheckButton from '../../common/button/ConnectivityCheckButton';
import React, { useEffect, useState } from 'react';
import { LLMClientConfig } from '../../../features/llm/base';
import systemSettingHandle from '../../../features/system/systemSettingHandle';
import { LLMSettingDTO, LiveSettingDTO, SystemSettingDTO } from '../../../../main/domain/dto/systemSettingDTO';
import LiveConnectivityCheckButton from '../../common/button/LiveConnectivityCheckButton';

const options: SelectProps['options'] = [];

interface BilibiliLiveSettingsProps {
  systemSetting: SystemSettingDTO;
}

const BilibiliLiveSettings: React.FC<BilibiliLiveSettingsProps> = ({ systemSetting }) => {

  const [enabled, setEnabled] = useState<boolean>(true);
  const [form] = Form.useForm();
  const liveType = 'bilibili';

  useEffect(() => {
    const bilibili_setting: LiveSettingDTO = systemSetting.live_setting?.bilibili;
    if (bilibili_setting) {
      form.setFieldValue('room_id', bilibili_setting.extended_attributes['room_id']);
      form.setFieldValue('cookie', bilibili_setting.extended_attributes['cookie']);
    }
  }, []);

  const onConnectivityCheckRes = (isError: boolean) => {
    if (!isError) {
      if (systemSetting) {
        const room_id = form.getFieldValue('room_id');
        const cookie: string[] = form.getFieldValue('cookie');
        const extended_attributes = {
          'room_id': room_id,
          'cookie': cookie
        };
        systemSetting.live_setting[liveType] = new LiveSettingDTO(liveType, enabled, extended_attributes);
        systemSettingHandle.createAndUpdateSystemSetting(systemSetting);
      }
    }
  };

  const onClick = () => {
    form.submit();
    const room_id = form.getFieldValue('room_id');
    const cookie = form.getFieldValue('cookie');
    const liveSettingDTO = new LiveSettingDTO(liveType, true, {
      room_id: room_id,
      cookie: cookie
    });
    return {
      liveType: liveType,
      liveSettingDTO: liveSettingDTO
    };
  };

  return (
    <Form
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      form={form}
      layout='horizontal'
      labelAlign='left'
      size='large'
      autoComplete='off'
    >
      <Form.Item name='room_id' colon={false}
                 label={<FormLabel title='直播间ID' description='填入B站直播间ID' />}
                 rules={[{ required: true, message: '请输入B站直播间ID' }]}
      >
        <Input placeholder='' />
      </Form.Item>
      <Form.Item name='cookie' colon={false}
                 label={<FormLabel title='授权cookie' description='填入B站授权cookie' />}
                 rules={[{ required: true, message: '请输入授权cookie' }]}
      >
        <Input placeholder='' />
      </Form.Item>
      <Form.Item colon={false} label={<FormLabel title='检查连通性' description='测试B站授权参数是否正确填写，并保存配置' />}
                 style={{ textAlign: 'right' }}>
        <LiveConnectivityCheckButton
          onClick={onClick}
          onConnectivityCheckRes={onConnectivityCheckRes}
        />
      </Form.Item>
    </Form>
  );
};

export default BilibiliLiveSettings;
