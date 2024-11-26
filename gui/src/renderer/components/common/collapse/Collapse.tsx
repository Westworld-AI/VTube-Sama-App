import { SwitchClickEventHandler } from 'antd/lib/switch';
import { Space, Switch } from 'antd';
import ModelIcon from '../icon/ModelIcon';
import CompanyIcon from '../icon/CompanyIcon';
import { collapseHeaderExtra, collapseHeaderLabel } from './CollapseCss';

export const genExtra = (enabled: boolean, onClick: SwitchClickEventHandler) => (
  <div className={collapseHeaderExtra}>
    <Switch checked={enabled} onClick={onClick} />
  </div>
);

export const genLLMHeard = (name: string, type: string) => {
  return (
    <Space align='center' className={collapseHeaderLabel}>
      <ModelIcon model={type} size={25} />
      <h3>{name}</h3>
    </Space>
  );
};

export const genCompanyHeard = (name: string, type: string) => {
  return (
    <Space align='center' className={collapseHeaderLabel}>
      <CompanyIcon name={type} size={25} />
      <h3>{name}</h3>
    </Space>
  );
};


