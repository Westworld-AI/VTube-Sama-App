import { Collapse } from 'antd';
import OpenAISettings from './llm/OpenAISettings';
import ZhiPuSettings from './llm/ZhiPuSettings';
import OllamaSettings from './llm/OllamaSettings';
import { useEffect, useState } from 'react';
import { LLMSettingDTO, SystemSettingDTO } from '../../../main/domain/dto/systemSettingDTO';
import systemSettingHandle from '../../features/system/systemSettingHandle';
import { collapseContainer, collapseHeaderContent } from './LLMSettingsCss';
import { genExtra, genLLMHeard } from '../common/collapse/collapse';
import HunyuanAgentSettings from './llm/HunyuanAgentSettings';

const LLMSettings = () => {

  const [currentSystemSettingDTO, setCurrentSystemSettingDTO] = useState<SystemSettingDTO | null>(null);
  const [openAIEnabled, setOpenAIEnabled] = useState<boolean>(false);
  const [ollamaEnabled, setOllamaEnabled] = useState<boolean>(false);
  const [zhiPuEnabled, setZhiPuEnabled] = useState<boolean>(false);
  const [hunyuanagentEnabled, setHunyuanagentEnabled] = useState<boolean>(false);


  useEffect(() => {
    loaderSystemSetting();
  }, []);

  const onClickOpenAIEnabled = () => {
    const enabled = !openAIEnabled;
    setOpenAIEnabled(enabled);
    if (currentSystemSettingDTO) {
      const openaiSetting: LLMSettingDTO = currentSystemSettingDTO?.llm_setting?.openai;
      if (openaiSetting) {
        openaiSetting.enabled = enabled;
        systemSettingHandle.createAndUpdateSystemSetting(currentSystemSettingDTO);
      }
    }
  };
  const onClickOllamaEnabled = () => {
    const enabled = !ollamaEnabled;
    setOllamaEnabled(enabled);
    if (currentSystemSettingDTO) {
      const ollamaSetting: LLMSettingDTO = currentSystemSettingDTO?.llm_setting?.ollama;
      if (ollamaSetting) {
        ollamaSetting.enabled = enabled;
        systemSettingHandle.createAndUpdateSystemSetting(currentSystemSettingDTO);
      }
    }

  };
  const onClickZhiPuEnabled = () => {
    const enabled = !zhiPuEnabled;
    setZhiPuEnabled(enabled);
    if (currentSystemSettingDTO) {
      const zhipuSetting: LLMSettingDTO = currentSystemSettingDTO?.llm_setting?.zhipu;
      if (zhipuSetting) {
        zhipuSetting.enabled = enabled;
        systemSettingHandle.createAndUpdateSystemSetting(currentSystemSettingDTO);
      }
    }
  };

  const onClickHunyuanagentEnabled = () => {
    const enabled = !hunyuanagentEnabled;
    setHunyuanagentEnabled(enabled);
    if (currentSystemSettingDTO) {
      const hunyuanagentSetting: LLMSettingDTO = currentSystemSettingDTO?.llm_setting?.hunyuanagent;
      if (hunyuanagentSetting) {
        hunyuanagentSetting.enabled = enabled;
        systemSettingHandle.createAndUpdateSystemSetting(currentSystemSettingDTO);
      }
    }
  };

  function loaderSystemSetting() {
    systemSettingHandle.getSystemSetting().then(systemSettingDTO => {
      if (systemSettingDTO) {
        setCurrentSystemSettingDTO(systemSettingDTO);
        const ollamaSetting: LLMSettingDTO = systemSettingDTO?.llm_setting?.ollama;
        if (ollamaSetting) {
          setOllamaEnabled(ollamaSetting.enabled);
        }
        const zhipuSetting: LLMSettingDTO = systemSettingDTO?.llm_setting?.zhipu;
        if (zhipuSetting) {
          setZhiPuEnabled(zhipuSetting.enabled);
        }
        const openaiSetting: LLMSettingDTO = systemSettingDTO?.llm_setting?.openai;
        if (openaiSetting) {
          setOpenAIEnabled(openaiSetting.enabled);
        }
        const hunyuanagentSetting: LLMSettingDTO = systemSettingDTO?.llm_setting?.hunyuanagent;
        if (hunyuanagentSetting) {
          setHunyuanagentEnabled(hunyuanagentSetting.enabled);
        }
      } else {
        console.log('not systemSetting');
      }
    });
  }

  const onCollapseChange = (key: string | string[]) => {
    console.log(key);
  };

  const items = [
    {
      key: 'openai',
      header: (
        <div className={collapseHeaderContent}>
          {genLLMHeard('OpenAI', 'openai')}
          {genExtra(openAIEnabled, onClickOpenAIEnabled)}
        </div>
      ),
      children: <OpenAISettings systemSetting={currentSystemSettingDTO} />
    }, ,
    {
      key: 'ollama',
      header: (
        <div className={collapseHeaderContent}>
          {genLLMHeard('Ollama', 'ollama')}
          {genExtra(ollamaEnabled, onClickOllamaEnabled)}
        </div>
      ),
      children: <OllamaSettings systemSetting={currentSystemSettingDTO} />
    },
    {
      key: 'zhipu',
      header: (
        <div className={collapseHeaderContent}>
          {genLLMHeard('智谱AI', 'zhipu')}
          {genExtra(zhiPuEnabled, onClickZhiPuEnabled)}
        </div>
      ),
      children: <ZhiPuSettings systemSetting={currentSystemSettingDTO} />
    },
    {
      key: 'hunyuanagent',
      header: (
        <div className={collapseHeaderContent}>
          {genLLMHeard('腾讯元器', 'hunyuanagent')}
          {genExtra(hunyuanagentEnabled, onClickHunyuanagentEnabled)}
        </div>
      ),
      children: <HunyuanAgentSettings systemSetting={currentSystemSettingDTO} />
    }];

  return (
    <div className={collapseContainer} style={{
      height: 'calc(100vh - 90px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingBottom: '30px',
      width: '90%',
      margin: '0 auto'
    }}>
      <Collapse
        size='small'
        onChange={onCollapseChange}
      >
        {items.map(item => (
          <Collapse.Panel header={item.header} key={item.key}>
            {item.children}
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default LLMSettings;
