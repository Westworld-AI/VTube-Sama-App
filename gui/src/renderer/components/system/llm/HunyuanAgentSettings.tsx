import {
  Form,
  Input,
  Select
} from 'antd';
import FormLabel from '../../common/label/FormLabel';
import LLMConnectivityCheckButton from '../../common/button/LLMConnectivityCheckButton';
import React, { useEffect, useState } from 'react';
import { LLMClientConfig } from '../../../features/llm/base';
import systemSettingHandle from '../../../features/system/systemSettingHandle';
import { LLMSettingDTO, SystemSettingDTO } from '../../../../main/domain/dto/systemSettingDTO';


interface HunyuanAgentSettingsProps {
  systemSetting: SystemSettingDTO;
}

const HunyuanAgentSettings: React.FC<HunyuanAgentSettingsProps> = ({ systemSetting }) => {

  const [form] = Form.useForm();
  const llmType = 'hunyuanagent';

  useEffect(() => {
    const openai_setting: LLMSettingDTO = systemSetting.llm_setting?.hunyuanagent;
    if (openai_setting) {
      form.setFieldValue('api_key', openai_setting.extended_attributes['api_key']);
      form.setFieldValue('assistant_id', openai_setting.extended_attributes['assistant_id']);
    }
  }, []);

  const onConnectivityCheckRes = (isError: boolean) => {
    if (!isError) {
      if (systemSetting) {
        const api_base = form.getFieldValue('api_key');
        const assistant_id: string = form.getFieldValue('assistant_id');
        const model_names: string[] = [assistant_id];
        const extended_attributes = {
          'api_key': api_base,
          'assistant_id': assistant_id,
          'model_names': model_names
        };
        systemSetting.llm_setting[llmType] = new LLMSettingDTO(llmType, true, extended_attributes);
        systemSettingHandle.createAndUpdateSystemSetting(systemSetting);
      }
    }
  };

  const onClick = () => {
    form.submit();
    const api_key = form.getFieldValue('api_key');
    const assistant_id = form.getFieldValue('assistant_id');
    const llmClientConfigs: LLMClientConfig[] = [];
    const expand = new Map<string, object>();
    expand.set('api_key', api_key);
    expand.set('assistant_id', assistant_id);
    llmClientConfigs.push({
      model_name: assistant_id,
      expand: expand
    });
    return {
      llmType: llmType,
      llmClientConfigs: llmClientConfigs
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
      <Form.Item name='assistant_id'
                 colon={false} label={<FormLabel title='智能体ID' description='请填入智能体ID' />}
                 rules={[{ required: true, message: '请填入智能体ID' }]}>
        <Input placeholder='sk-xxxxxxxxxxxxx' />
      </Form.Item>
      <Form.Item name='api_key' colon={false}
                 label={<FormLabel title='智能体Token' description='填入 智能体Token' />}
                 rules={[{ required: true, message: '请填入智能体Token' }]}
      >
        <Input placeholder='xxxxxxx' />
      </Form.Item>
      <Form.Item colon={false}
                 label={<FormLabel title='检查连通性' description='测试腾讯元器智能体参数是否正确填写，并保存配置' />}
                 style={{ textAlign: 'right' }}>
        <LLMConnectivityCheckButton
          onClick={onClick}
          onConnectivityCheckRes={onConnectivityCheckRes}
        />
      </Form.Item>
    </Form>
  );
};

export default HunyuanAgentSettings;
