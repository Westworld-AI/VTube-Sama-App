import {HashRouter as Router, Routes, Route, Outlet, useLocation} from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import CharacterSpace from './pages/CharacterSpace';
import EditCharacterSpace from './pages/EditCharacterSpace';
import MainMenu from './components/menu/MainMenu';
import CreativeWorkshop from './pages/CreativeWorkshop';
import SystemSetting from './pages/SystemSetting';
import LiveView from './components/livepage/LiveView';
import {NextUIProvider} from "@nextui-org/system";


const MainApp = () => {

  const location = useLocation(); // 使用 useLocation 钩子获取当前路径
  const pathName = location.pathname;

  // 检查当前路径是否为首页，如果是，则不加入额外的类名
  const contentClassName = pathName === '/' || pathName === '/home' ? '' : 'mt-16 min-h-[280px]';

  return (
    <NextUIProvider>
      <div className="fixed top-0 left-0 w-full flex flex-col items-center z-20">
        <div className="w-full h-5 webkit-app-region-drag"></div>
        <div className="w-full flex justify-center">
          <MainMenu/>
        </div>
      </div>
      <div className={contentClassName}>
        {
          pathName === '/' || pathName === '/home' ? <></> : <div className="border-t border-gray-300 mt-20"/>
        }
        <Outlet/>
      </div>
    </NextUIProvider>
  );
};

const LiveApp = () => {
  return (
    <Outlet/>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<MainApp/>}>
          <Route index element={<Home/>}/>
          <Route path='home' element={<Home/>}/>
          <Route path='character-space' element={<CharacterSpace/>}/>
          <Route path='edit-character-space' element={<EditCharacterSpace/>}/>
          <Route path='creative-workshop' element={<CreativeWorkshop/>}/>
          <Route path='system-setting' element={<SystemSetting/>}/>
        </Route>
        <Route path='/live' element={<LiveApp/>}>
          <Route path='live-view' element={<LiveView/>}/>
        </Route>
      </Routes>
    </Router>
  );
}
