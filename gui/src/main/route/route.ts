// entityMap.ts: 映射实体名称到其数据库操作类
// ...导入其他实体操作类

import {CharacterService} from "../domain/service/characterService";
import {VoiceService} from "../domain/service/voiceService";
import {SystemSettingService} from "../domain/service/systemSettingService";
import {CharacterChatHistoryService} from "../domain/service/characterChatHistoryService";
import {FileService} from "../domain/service/fileService";
import {CharacterModelService} from "../domain/service/characterModelService";
import {LiveRoomManageService} from "../domain/service/liveClientMangeService";
import {VisionService} from "../domain/service/visionService";

export const EntityMap = {
  CharacterService: CharacterService,
  VoiceService: VoiceService,
  SystemSettingService: SystemSettingService,
  CharacterChatHistoryService: CharacterChatHistoryService,
  FileService: FileService,
  CharacterModelService: CharacterModelService,
  LiveRoomManageService: LiveRoomManageService,
  VisionService: VisionService,
};

// 如果没有为特定实体定义操作类，则会返回基本实现。
export function getDefaultEntityOperations(entityName: string) {
  return EntityMap[entityName];
}
