// ipcHandlers.ts: 主进程的IPC事件处理程序，负责根据请求调用特定实体的数据库操作
import {ipcMain} from 'electron';
import {getDefaultEntityOperations} from "../route/route";

export class IpcHandlers {
  constructor() {
    // 注册'handleDatabaseEvents'作为处理数据库操作请求的回调函数
    ipcMain.handle('database', this.handleDatabaseEvents);
  }

  async handleDatabaseEvents(event, {entityName, type, payload}) {

    // 获取适合给定实体的操作类（如果没有特定的类，将返回基本实现）
    const operationsClass = getDefaultEntityOperations(entityName);
    const operations = new operationsClass();

    // 检查实体是否具有所请求的操作，如果有，则调用它
    if (operations[type]) {
      return operations[type](payload);
    } else {
      // 如果没有这样的操作，则抛出错误
      return Promise.reject(`Unsupported operation type: ${type} for entity: ${entityName}`);
    }
  }
}
