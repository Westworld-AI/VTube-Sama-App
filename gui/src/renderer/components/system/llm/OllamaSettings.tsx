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

const options: SelectProps['options'] = [];

interface OllamaSettingsProps {
  systemSetting: SystemSettingDTO;
}

const OllamaSettings: React.FC<OllamaSettingsProps> = ({systemSetting}) => {

  const [enabled, setEnabled] = useState<boolean>(true);
  const [form] = Form.useForm();
  const llmType = "ollama";

  useEffect(() => {
    const ollama_setting: LLMSettingDTO = systemSetting.llm_setting?.ollama
    if (ollama_setting) {
      form.setFieldValue("api_base", ollama_setting.extended_attributes["api_base"])
      form.setFieldValue("model_names", ollama_setting.extended_attributes["model_names"])
    }
  }, []);

  const onConnectivityCheckRes = (isError: boolean) => {
    if (!isError) {
      if (systemSetting) {
        const api_base = form.getFieldValue("api_base");
        const model_names: string[] = form.getFieldValue("model_names");
        const extended_attributes = {
          "api_base": api_base,
          "model_names": model_names
        };
        systemSetting.llm_setting[llmType] = new LLMSettingDTO(llmType, enabled, extended_attributes);
        systemSettingHandle.createAndUpdateSystemSetting(systemSetting);
      }
    }
  };

  const onClick = () => {
    form.submit();
    let api_base = form.getFieldValue("api_base") ?? "http://localhost:11434";
    const model_names: string[] = form.getFieldValue("model_names")
    const llmClientConfigs: LLMClientConfig[] = []
    if (model_names) {
      model_names.forEach(modelName => {
        const expand = new Map<string, object>();
        expand.set("api_base", api_base)
        llmClientConfigs.push({
          model_name: modelName,
          expand: expand
        })
      })
    }
    return {
      llmType: "ollama",
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
      <Form.Item name="api_base" colon={false}
                 label={<FormLabel title="接口代理地址" description="填入 Ollama 接口代理地址"/>}
                 rules={[{required: true, message: '请输入接口代理地址'}]}
                 initialValue="http://127.0.0.1:11434"
      >
        <Input placeholder="http://127.0.0.1:11434"/>
      </Form.Item>
      <Form.Item name="model_names"
                 colon={false} label={<FormLabel title="模型列表" description="您可以输入模型名称，例如：qwen:7b"/>}
                 rules={[{required: true, message: '请选择或输入语言模型'}]}>
        <Select placeholder="请选择或输入语言模型"
                mode="tags"
                style={{width: '100%'}}
                tokenSeparators={[',']}
                options={options}
        />
      </Form.Item>
      <Form.Item colon={false} label={<FormLabel title="检查连通性" description="测试代理地址是否正确填写，并保存配置"/>}
                 style={{textAlign: 'right'}}>
        <LLMConnectivityCheckButton
          onClick={onClick}
          onConnectivityCheckRes={onConnectivityCheckRes}
        />
      </Form.Item>
    </Form>
  )
}

export default OllamaSettings;
