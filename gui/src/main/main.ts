/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, protocol, ProtocolRequest, ProtocolResponse } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import 'reflect-metadata';
import { IpcHandlers } from './framework/ipcHandlers';
import { databaseService } from './framework/orm/database';
import { liveRoomEnvironment, liveRoomManage } from './apps/environment/liveRoomEnvironment';
import { controlTaskManage } from './apps/control/control';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import { LiveEventPriorityEnum, LiveEventTypeEnum } from './framework/live/base';
import ocrStorage from "./framework/vision/OCRTextStorage";


let childWindows = new Map<number, BrowserWindow>();
let mainWindow: BrowserWindow | null = null;

function registerFileProtocol() {
  protocol.registerFileProtocol('modelfile', (request: ProtocolRequest, callback: (response: string | ProtocolResponse) => void) => {
    const url = request.url.replace(/^modelfile:\/\//, '');
    const filePath = path.join(app.getPath('userData'), 'models', url);
    callback({ path: filePath });
  });
  protocol.registerFileProtocol('mediafile', (request: ProtocolRequest, callback: (response: string | ProtocolResponse) => void) => {
    const url = request.url.replace(/^mediafile:\/\//, '');
    const filePath = path.join(app.getPath('userData'), 'media', url);
    callback({ path: filePath });
  });
  protocol.registerFileProtocol('imagesfile', (request: ProtocolRequest, callback: (response: string | ProtocolResponse) => void) => {
    const url = request.url.replace(/^imagesfile:\/\//, '');
    const filePath = path.join(app.getPath('userData'), 'images', url);
    callback({ path: filePath });
  });
}


async function initializeApp() {
  try {
    await databaseService.initDatabase();
  } catch (error) {
    console.error('Failed to initialize the app:', error);
    app.quit();
  }
}

app.on('ready', initializeApp);

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    // autoUpdater.checkForUpdatesAndNotify();
  }
}

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('getBasePath', (event) => {
  // 根据环境返回正确的资源路径
  if (process.env.NODE_ENV === 'production') {
    return `file://${process.resourcesPath}/assets/js/`;
  } else {
    // 此处返回开发环境中的相对路径，视具体开发服务器配置而定。
    return 'assets/js/';
  }
});

ipcMain.handle('getBaseVoskModelPath', (event, voskModelPath) => {
  // 根据环境返回正确的资源路径
  if (process.env.NODE_ENV === 'production') {
    return `file://${process.resourcesPath}/assets/vosk/${voskModelPath}`;
  } else {
    // 此处返回开发环境中的相对路径，视具体开发服务器配置而定。
    return `assets/vosk/${voskModelPath}`;
  }
});

app.on('ready', () => {
  // 确保在应用程序准备就绪之后注册 IPC 事件处理程序
  new IpcHandlers();
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  // if (isDebug) {
  await installExtensions();
  // }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      webSecurity: false,
      devTools: true
    }
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  mainWindow.webContents.openDevTools();
  // mainWindow.webContents.closeDevTools();

  const initControlTaskManage = controlTaskManage;
  initControlTaskManage.subscribe((controlTask) => {
    childWindows.forEach((win, id) => {
      win.webContents.send('message-from-main', {
        type: 'control',
        data: controlTask
      });
    });
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};


function createNewWindow() {

  const newWindow = new BrowserWindow({
    title: 'LIVE',
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      contextIsolation: true, // 启用contextIsolation
      nodeIntegration: false, // 由于启用了contextIsolation，通常建议禁用nodeIntegration
      devTools: true,
    }
  });

  newWindow.webContents.openDevTools();
  // newWindow.webContents.closeDevTools();

  // 使用resolveHtmlPath确保路径正确
  newWindow.loadURL(resolveHtmlPath('index.html') + '#/live/live-view');
  const windowId = newWindow.id;
  childWindows.set(windowId, newWindow);

  newWindow.on('closed', () => {
    childWindows.delete(windowId);
    liveRoomManage.shutdown();
    if (mainWindow) {
      mainWindow.webContents.send('closeNewWindow', 'CloseNewWindow Event');
    }
  });
}

ipcMain.handle('open-new-window', async (event, ...args) => {
  createNewWindow();
});

// 广播向子程序发送消息
ipcMain.on('notify-children', (event, message) => {
  childWindows.forEach((win, id) => {
    win.webContents.send('message-from-main', message);
  });
});


const HTTP_SERVER_PORT = 8889;
const createHttpServer = () => {
  const expressApp = express();
  expressApp.use(bodyParser.json());
  expressApp.get('/health', (req, res) => {
    res.send({ code: 200, status: 'normal' });
  });
  expressApp.post('/game/message', (req, res) => {
    const message = req.body;
    liveRoomEnvironment.enqueue({
      user_id: 'yakami',
      user_name: 'yakami',
      type: LiveEventTypeEnum.DANMAKU,
      content: message['msg'],
      priority: LiveEventPriorityEnum.DEFAULT_DANMAKU
    }, 1);
    // 处理接收到的消息
    res.send({ status: 'Message received' });
  });
  expressApp.post('/vision/push', (req, res) => {
    const ocrResult = req.body["ocr_result"];
    ocrStorage.push(ocrResult);
    res.send({ status: 'Message received' });
  });
  const options = {};
  http.createServer(options, expressApp).listen(HTTP_SERVER_PORT, () => {
    console.log(`HTTP Server is running on http://localhost:${HTTP_SERVER_PORT}`);
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createHttpServer();
    registerFileProtocol();
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
