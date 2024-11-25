import {
  Button,
  Form,
  Input,
  Select,
  SelectProps
} from 'antd';
import FormLabel from "../../common/label/FormLabel";
import LLMConnectivityCheckButton from "../../common/button/LLMConnectivityCheckButton";
import React, {useEffect, useState} from "react";
import {LLMClientConfig} from "../../../features/llm/base";
import systemSettingHandle from "../../../features/system/systemSettingHandle";
import {LLMSettingDTO, SystemSettingDTO} from "../../../../main/domain/dto/systemSettingDTO";

const options: SelectProps['options'] = [
  {
    label: "charglm-3（超拟人大模型）",
    value: "charglm-3",
  }, {
    label: "glm-4",
    value: "glm-4",
  }
  , {
    label: "glm-3-turbo",
    value: "glm-3-turbo",
  }
];

interface ZhiPuSettingsProps {
  systemSetting: SystemSettingDTO;
}

const ZhiPuSettings: React.FC<ZhiPuSettingsProps> = ({systemSetting}) => {

  const [form] = Form.useForm();
  const llmType = "zhipu";

  useEffect(() => {
    const openai_setting: LLMSettingDTO = systemSetting.llm_setting?.zhipu
    if (openai_setting) {
      form.setFieldValue("api_key", openai_setting.extended_attributes["api_key"])
      form.setFieldValue("model_names", openai_setting.extended_attributes["model_names"])
    }
  }, []);

  const onConnectivityCheckRes = (isError: boolean) => {
    if (!isError) {
      if (systemSetting) {
        const api_base = form.getFieldValue("api_key");
        const model_names: string[] = form.getFieldValue("model_names");
        const extended_attributes = {
          "api_key": api_base,
          "model_names": model_names
        };
        systemSetting.llm_setting[llmType] = new LLMSettingDTO(llmType, true, extended_attributes);
        systemSettingHandle.createAndUpdateSystemSetting(systemSetting);
      }
    }
  };

  const onClick = () => {
    form.submit();
    const api_key = form.getFieldValue("api_key");
    const model_names: string[] = form.getFieldValue("model_names")
    const llmClientConfigs: LLMClientConfig[] = []
    if (model_names) {
      model_names.forEach(modelName => {
        const expand = new Map<string, object>();
        expand.set("api_key", api_key)
        llmClientConfigs.push({
          model_name: modelName,
          expand: expand
        })
      })
    }
    return {
      llmType: "zhipu",
      llmClientConfigs: llmClientConfigs
    }
  };

  return (
    <Form
      labelCol={{span: 8}}
      wrapperCol={{span: 16}}
      form={form}
      layout="horizontal"
      labelAlign='left'
      size="large"
      autoComplete="off"
    >
      <Form.Item name="api_key" colon={false}
                 label={<FormLabel title="Zhipu API Key" description="填入 Zhipu API Key"/>}
                 rules={[{required: true, message: '请Zhipu API Key'}]}
      >
        <Input placeholder="sk-xxxxxxxxxxxxx"/>
      </Form.Item>
      <Form.Item name="model_names"
                 colon={false} label={<FormLabel title="模型列表" description="您可以输入模型名称，例如：glm-4"/>}
                 rules={[{required: true, message: '请选择或输入语言模型'}]}>
        <Select placeholder="请选择或输入语言模型"
                mode="tags"
                style={{width: '100%'}}
                tokenSeparators={[',']}
                options={options}
        />
      </Form.Item>
      <Form.Item colon={false} label={<FormLabel title="检查连通性" description="测试Zhipu API Key是否正确填写，并保存配置"/>}
                 style={{textAlign: 'right'}}>
        <LLMConnectivityCheckButton
          onClick={onClick}
          onConnectivityCheckRes={onConnectivityCheckRes}
        />
      </Form.Item>
    </Form>
  )
}

export default ZhiPuSettings;
