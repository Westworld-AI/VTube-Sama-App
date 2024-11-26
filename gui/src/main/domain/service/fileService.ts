import AdmZip from 'adm-zip';
import { app } from 'electron';
import * as crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { UploadFileResultDTO } from '../dto/UploadFileDTO';


export class FileService {

  async uploadImage(filePath: string): Promise<UploadFileResultDTO> {
    const ext = path.extname(filePath);
    const randomName = crypto.randomBytes(8).toString('hex');
    const fileName = `${randomName}${ext}`;
    const folderName = 'images';
    const uploadDir = path.join(app.getPath('userData'), folderName);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadPath = path.join(uploadDir, fileName);
    fs.copyFileSync(filePath, uploadPath);
    return new UploadFileResultDTO(false, fileName, 'imagesfile://' + fileName);
  }

  async uploadLive2d(filePath: string): Promise<UploadFileResultDTO> {
    const fileName = path.basename(filePath);
    const timestamp = Date.now()
    const uploadDir = path.join(app.getPath('userData'), 'models', `${timestamp}`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uploadPath = path.join(uploadDir, fileName);
    fs.copyFileSync(filePath, uploadPath);

    // 解压缩上传的zip文件
    const zip = new AdmZip(uploadPath);
    const extractedPath = path.join(uploadDir);
    const folderName = path.basename(fileName, '.zip');

    // 确保解压目录存在
    if (!fs.existsSync(extractedPath)) {
      fs.mkdirSync(extractedPath, { recursive: true });
    }

    try {
      zip.extractAllTo(extractedPath, true);
    } catch (error) {
      console.error('Failed to extract zip file:', error);
      return new UploadFileResultDTO(true, '', '');
    }

    // 检查是否存在 "{file_name}.model3.json" 文件
    const modelFileName = `${folderName}.model3.json`;
    const decompressionPath = path.join(extractedPath, folderName);
    const absoluteModelFilePath = path.join(decompressionPath, modelFileName);

    console.log('modelFileName:', modelFileName);
    console.log('modelFilePath:', absoluteModelFilePath);
    console.log('!fs.existsSync(modelFilePath):', !fs.existsSync(absoluteModelFilePath));

    if (!fs.existsSync(absoluteModelFilePath)) {
      // 如果不存在，则返回错误信息
      return new UploadFileResultDTO(true, '', '');
    } else {
      const relativeModelFilePath = `${timestamp}/${folderName}/${folderName}.model3.json`;
      return new UploadFileResultDTO(false, folderName, 'modelfile://' + relativeModelFilePath);
    }
  }

  async delete(filePath: string): Promise<boolean> {
    try {
      await fs.unlinkSync(filePath);
      console.log(`File ${filePath} was deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error occurred while deleting file ${filePath}: ${error.message}`);
      return false;
    }
  }

}
