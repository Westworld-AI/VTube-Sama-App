import {AppstoreOutlined, HomeOutlined, DropboxOutlined, SettingOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import {Tab, Tabs} from "@nextui-org/tabs";

// 使用Segmented组件代替Tabs
const MainMenu = () => {
  const navigate = useNavigate();
  const menuItems = [
    {
      label: (
        <div className="flex items-center space-x-2">
          <HomeOutlined/>
          <span>Home</span>
        </div>
      ),
      value: 'home'
    },
    {
      label: (
        <div className="flex items-center space-x-2">
          <AppstoreOutlined/>
          <span>角色管理</span>
        </div>
      ),
      value: 'character-space'
    },
    {
      label: (
        <div className="flex items-center space-x-2">
          <DropboxOutlined/>
          <span>创意工坊</span>
        </div>
      ),
      value: 'creative-workshop'
    },
    {
      label: (
        <div className="flex items-center space-x-2">
          <SettingOutlined/>
          <span>系统设置</span>
        </div>
      ),
      value: 'system-setting'
    }
  ];

  const onTabChange = (key: React.Key) => {
    navigate(`/${key}`);
  };

  return (
    <Tabs aria-label="Options" color="primary" variant="bordered"
          onSelectionChange={(key: React.Key) => onTabChange(key)}>
      {
        menuItems.map((item) => (
          <Tab key={item.value} title={item.label}/>
        ))
      }
    </Tabs>
  );
};
export default MainMenu;
