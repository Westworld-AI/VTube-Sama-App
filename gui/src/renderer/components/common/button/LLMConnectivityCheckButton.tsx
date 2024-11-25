import {Alert, Button} from "antd";
import {useEffect, useState} from "react";
import {LLMClientConfig} from "../../../features/llm/base";
import llmClient from "../../../features/llm/client";

interface LLmClientParamProps {
  llmType: string,
  llmClientConfigs: LLMClientConfig[]
}

interface ConnectivityCheckProps {
  onClick: () => LLmClientParamProps;
  onConnectivityCheckRes: (isError: boolean) => void;
}

const LLMConnectivityCheckButton: React.FC<ConnectivityCheckProps> =
  ({
     onClick,
     onConnectivityCheckRes
   }) => {
    const [isError, setIsError] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");
    const [logs, setLogs] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const onConnectivityCheck = () => {
      setLoading(true);
      const llmClientParamProps = onClick()
      const llmType = llmClientParamProps.llmType
      const llmClientConfigs = llmClientParamProps.llmClientConfigs
      llmClient.batchConnectivityCheck(llmType, llmClientConfigs).then(res => {
        setIsError(res.isError);
        setMsg(res.msg);
        setLogs(res.logs);
        onConnectivityCheckRes(res.isError);
        setLoading(false);
      })
    }

    return (
      <div>
        <Button type="primary" loading={loading} onClick={onConnectivityCheck}>检查</Button>
        {msg && (
          <Alert
            style={{marginTop: "10px"}}
            message={msg}
            description={logs}
            type={isError ? "error" : "success"}
            showIcon/>
        )}
      </div>
    );
  };

export default LLMConnectivityCheckButton;
