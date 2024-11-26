import React, {useEffect, useState} from 'react';
import {Layout, Menu, MenuProps, theme} from "antd";
import {UserOutlined, MessageOutlined, AlertOutlined} from "@ant-design/icons";
import {useLocation} from 'react-router-dom';
import CharacterSetting from "../components/character/CharacterSetting";
import ChatHistroy from "../components/memory/ChatHistroy";
import Sider from "antd/es/layout/Sider"


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
  getItem('characterSetting', '基础设置', <UserOutlined/>),
  getItem('chatHistory', '对话记录', <MessageOutlined/>),
  // getItem('直播计划', '直播计划', <AlertOutlined/>),
  // getItem('朋友圈', '朋友圈', <AlertOutlined/>),
  // getItem('反思策略', '反思策略', <AlertOutlined/>),
  // ...其他菜单项
];

const EditCharacterSpace = () => {

  const [selectedKey, setSelectedKey] = useState('characterSetting');
  const {
    token: {colorBgContainer, borderRadiusLG},
  } = theme.useToken();

  const location = useLocation();
  const [characterId, setCharacterId] = useState<number | undefined>(-1); // characterId 初始化为 undefined

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    if (id) {
      setCharacterId(Number(id));
      console.log("CharacterId:", characterId)
    } else {
      console.log('No character ID found in URL params');
    }
  }, [location]);

  const onMenuClick = (e: any) => {
    setSelectedKey(e.key);
  };

  // 根据选中的菜单项渲染对应的组件
  const renderContent = () => {
    switch (selectedKey) {
      case 'characterSetting':
        return <CharacterSetting characterId={characterId}/>;
      case 'chatHistory':
        return <ChatHistroy characterId={characterId}/>;
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

export default EditCharacterSpace;
