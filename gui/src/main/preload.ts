import { app, contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke: (entityName: string, type: string, payload) => {
      return ipcRenderer.invoke('database', { entityName, type, payload });
    },

    invokeOpenNewWindow: (...args: unknown[]) => ipcRenderer.invoke('open-new-window', ...args),

    removeListener: (channel: Channels, func: (...args: any[]) => void) => ipcRenderer.removeListener(channel, func),

    removeAllListeners: (channel: Channels) => ipcRenderer.removeAllListeners(channel)
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  getBasePath: () => ipcRenderer.invoke('getBasePath'),
  getVoskModelPath: (voskModelPath: String) => ipcRenderer.invoke('getBaseVoskModelPath', voskModelPath)
});

interface Message {
  type: string;
  data: any;
}

contextBridge.exposeInMainWorld('messageApi', {
  ipcRenderer: {
    sendMessageToChildWindows: (context: Message) => ipcRenderer.send('notify-children', context),
    sendToMain: (channel: string, data: any) => ipcRenderer.send(channel, data),
    receiveFromMain: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  }
});
