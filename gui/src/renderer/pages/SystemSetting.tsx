import React, {useState} from 'react';
import {Layout, Menu, MenuProps, theme} from "antd";
import Sider from "antd/es/layout/Sider"
import LLMSettings from "../components/system/LLMSettings";
import LiveSettingt from '../components/system/LiveSetting';
import {RiLiveFill} from 'react-icons/ri';
import {TbBrain} from 'react-icons/tb';


type MenuItem = Required<MenuProps>['items'][number];
const {Content} = Layout;

function getItem(
  key: React.Key,
  label: React.ReactNode,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuItem[] = [
  // getItem('baseSettings', '基础设置', <UserOutlined/>),
  getItem('llmSettings', '语言模型设置', <TbBrain/>),
  getItem('liveSetting', '直播平台设置', <RiLiveFill/>),
];

const EditCharacterSpace = () => {

  const [selectedKey, setSelectedKey] = useState('llmSettings');
  const {
    token: {colorBgContainer, borderRadiusLG},
  } = theme.useToken();


  const onMenuClick = (e: any) => {
    setSelectedKey(e.key);
  };

  // 根据选中的菜单项渲染对应的组件
  const renderContent = () => {
    switch (selectedKey) {
      // case 'baseSettings':
      //   return <BaseSettings/>;
      case 'llmSettings':
        return <LLMSettings/>;
      case 'liveSetting':
        return <LiveSettingt/>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Sider width={200} style={{background: colorBgContainer}}>
        <Menu
          mode="inline"
          theme="light"
          style={{height: '100%', borderRight: 0}}
          items={items}
          onClick={onMenuClick}
          selectedKeys={[selectedKey]}
        />
      </Sider>
      <Layout className="pl-1">
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default EditCharacterSpace;
