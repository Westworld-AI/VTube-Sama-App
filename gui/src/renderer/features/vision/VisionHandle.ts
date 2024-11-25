export class VisionHandle {

  async push(context: string): Promise<void> {
    await window.electron.ipcRenderer.invoke('VisionService', 'push', context);
  }

  async getLast(): Promise<string> {
    return await window.electron.ipcRenderer.invoke('VisionService', 'getLast', null);
  }

  async getNewest(number: number): Promise<string[]> {
    return await window.electron.ipcRenderer.invoke('VisionService', 'getNewest', number);
  }
}

const visionHandle = new VisionHandle();
export default visionHandle;
