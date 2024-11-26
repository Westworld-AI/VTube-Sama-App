import { Collapse, Divider, Flex } from 'antd';
import { collapseContainer, collapseHeaderContent } from '../system/LLMSettingsCss';
import { genCompanyHeard, genExtra, genLLMHeard } from '../common/collapse/collapse';
import { useEffect, useState } from 'react';
import BilibiliLiveSettings from './live/BilibiliLiveSettings';
import systemSettingHandle from '../../features/system/systemSettingHandle';
import { LiveSettingDTO, LLMSettingDTO, SystemSettingDTO } from '../../../main/domain/dto/systemSettingDTO';

interface LiveSettingtProps {
}

const LiveSettingt: React.FC<LiveSettingtProps> = ({}) => {

  const [currentSystemSettingDTO, setCurrentSystemSettingDTO] = useState<SystemSettingDTO | null>(null);
  const [bilibiliEnabled, setBilibiliEnabled] = useState<boolean>(false);
  const [douyinEnabled, setDouyinEnabled] = useState<boolean>(false);

  useEffect(() => {
    loaderSystemSetting();
  }, []);

  const onClickBilibiliEnabled = (checked: boolean, event: Event) => {
    const enabled = !bilibiliEnabled;
    setBilibiliEnabled(enabled);
    if (currentSystemSettingDTO) {
      const bilibiliSetting: LLMSettingDTO = currentSystemSettingDTO?.live_setting?.bilibili;
      if (bilibiliSetting) {
        bilibiliSetting.enabled = enabled;
        systemSettingHandle.createAndUpdateSystemSetting(currentSystemSettingDTO);
      }
    }
  };

  const onClickDouyinEnabled = (checked: boolean, event: Event) => {
    const enabled = !douyinEnabled;
    setDouyinEnabled(enabled);
  };

  function loaderSystemSetting() {
    systemSettingHandle.getSystemSetting().then(systemSettingDTO => {
      if (systemSettingDTO) {
        setCurrentSystemSettingDTO(systemSettingDTO);
        const bilibiliSetting: LiveSettingDTO = systemSettingDTO?.live_setting?.bilibili;
        if (bilibiliSetting) {
          setBilibiliEnabled(bilibiliSetting.enabled);
        }
        // const zhipuSetting: LLMSettingDTO = systemSettingDTO?.llm_setting?.zhipu;
        // if (zhipuSetting) {
        //   setZhiPuEnabled(zhipuSetting.enabled);
        // }
        // const openaiSetting: LLMSettingDTO = systemSettingDTO?.llm_setting?.openai;
        // if (openaiSetting) {
        //   setOpenAIEnabled(openaiSetting.enabled);
        // }
      } else {
        console.log('not systemSetting');
      }
    });
  }

  const items = [
    {
      key: 'B站',
      header: (
        <div className={collapseHeaderContent}>
          {genCompanyHeard('B站', 'blibili')}
          {genExtra(bilibiliEnabled, onClickBilibiliEnabled)}
        </div>
      ),
      children: <BilibiliLiveSettings systemSetting={currentSystemSettingDTO} />
    },
    // {
    //   key: '抖音',
    //   header: (
    //     <div className={collapseHeaderContent}>
    //       {genCompanyHeard('抖音', 'douyin')}
    //       {genExtra(douyinEnabled, onClickDouyinEnabled)}
    //     </div>
    //   ),
    //   children: <p>123123</p>
    // }
  ];

  const onCollapseChange = (key: string | string[]) => {
    console.log(key);
  };

  return <Flex gap='middle' vertical>
    <Flex vertical>
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
    </Flex>
  </Flex>;
};

export default LiveSettingt;
