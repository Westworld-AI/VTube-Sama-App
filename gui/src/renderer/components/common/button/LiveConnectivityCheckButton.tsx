import { Alert, Button } from 'antd';
import { useEffect, useState } from 'react';
import { LLMClientConfig } from '../../../features/llm/base';
import llmClient from '../../../features/llm/client';
import { LiveSettingDTO } from '../../../../main/domain/dto/systemSettingDTO';
import liveClienHandle from '../../../features/live/LiveClienHandle';

interface LiveClientParamProps {
  liveType: string,
  liveSettingDTO: LiveSettingDTO
}

interface ConnectivityCheckProps {
  onClick: () => LiveClientParamProps;
  onConnectivityCheckRes: (isError: boolean) => void;
}

const LiveConnectivityCheckButton: React.FC<ConnectivityCheckProps> =
  ({
     onClick,
     onConnectivityCheckRes
   }) => {
    const [isError, setIsError] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>('');
    const [logs, setLogs] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const onConnectivityCheck = () => {
      setLoading(true);
      const llmClientParamProps = onClick();
      const liveSettingDTO = llmClientParamProps.liveSettingDTO;
      liveClienHandle.check_connect(liveSettingDTO).then(isConnect => {
        const isError = !isConnect;
        setIsError(isError);
        setMsg(isError ? '连接失败，请检查cookie是否正确' : '连接成功');
        setLogs('');
        onConnectivityCheckRes(isError);
        setLoading(false);
      });
    };

    return (
      <div>
        <Button type='primary' loading={loading} onClick={onConnectivityCheck}>检查</Button>
        {msg && (
          <Alert
            style={{ marginTop: '10px' }}
            message={msg}
            description={logs}
            type={isError ? 'error' : 'success'}
            showIcon />
        )}
      </div>
    );
  };

export default LiveConnectivityCheckButton;
