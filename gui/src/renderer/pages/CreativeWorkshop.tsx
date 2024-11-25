import React, {useEffect, useState} from 'react';
import {Layout, Menu, MenuProps, theme} from "antd";
import {UserOutlined, MessageOutlined, AlertOutlined} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider"
import LLMSettings from "../components/system/LLMSettings";
import CharacterModel from "../components/creativeworkshop/CharacterModel";
import VoiceModel from "../components/creativeworkshop/VoiceModel";


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
  getItem('role-market', '角色市场', <UserOutlined/>),
  getItem('character-model', '人物模型', <UserOutlined/>),
  getItem('voice-model', '语音模型', <UserOutlined/>),
  getItem('skill', '技能', <MessageOutlined/>),
];

const CreativeWorkshop = () => {

  const [selectedKey, setSelectedKey] = useState('character-model');
  const {
    token: {colorBgContainer, borderRadiusLG},
  } = theme.useToken();


  const onMenuClick = (e: any) => {
    setSelectedKey(e.key);
  };

  // 根据选中的菜单项渲染对应的组件
  const renderContent = () => {
    switch (selectedKey) {
      case 'character-model':
        return <CharacterModel/>;
      case 'voice-model':
        return <VoiceModel/>;
      // 你可以在这里加入更多的case来处理其他Item
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

export default CreativeWorkshop;
