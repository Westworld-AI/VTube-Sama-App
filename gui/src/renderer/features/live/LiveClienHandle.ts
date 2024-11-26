import { LiveSettingDTO } from "main/domain/dto/systemSettingDTO";

class LiveClientHandle {

    async start(liveSettingDTO: LiveSettingDTO): Promise<void> {
         await window.electron.ipcRenderer.invoke('LiveRoomManageService', 'start', liveSettingDTO);
    }

    async shutdown(): Promise<void> {
         await window.electron.ipcRenderer.invoke('LiveRoomManageService', 'shutdown', null);
    }

    async check_connect(liveSettingDTO: LiveSettingDTO): Promise<boolean> {
         return await window.electron.ipcRenderer.invoke('LiveRoomManageService', 'check_connect', liveSettingDTO);
    }

    async restart(): Promise<void> {
         await window.electron.ipcRenderer.invoke('LiveRoomManageService', 'restart', null);
    }

}




const liveClienHandle = new LiveClientHandle();
export default liveClienHandle;
