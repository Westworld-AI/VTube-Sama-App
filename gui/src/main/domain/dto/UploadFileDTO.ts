export class UploadFileResultDTO {

  isError:boolean;
  fileName: string;
  filePath: string;


  constructor(isError: boolean, fileName: string, filePath: string) {
    this.isError = isError;
    this.fileName = fileName;
    this.filePath = filePath;
  }
}
