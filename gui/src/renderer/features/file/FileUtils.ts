import { UploadFileResultDTO } from '../../../main/domain/dto/UploadFileDTO';

export class FileServiceHandle {

  async uploadLive2d(filePath: string): Promise<UploadFileResultDTO> {
    const uploadFileResultDTO = await window.electron.ipcRenderer.invoke('FileService', 'uploadLive2d', filePath);
    return uploadFileResultDTO;
  }

  async uploadImage(filePath: string): Promise<UploadFileResultDTO> {
    const uploadFileResultDTO = await window.electron.ipcRenderer.invoke('FileService', 'uploadImage', filePath);
    return uploadFileResultDTO;
  }

  async delete(filePath: string): Promise<boolean> {
    const success = await window.electron.ipcRenderer.invoke('FileService', 'delete', filePath);
    return success;
  }
}

const fileServiceHandle = new FileServiceHandle();
export default fileServiceHandle;
