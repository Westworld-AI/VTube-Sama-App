import { LiveSettingDTO } from '../dto/systemSettingDTO';
import { liveRoomManage, LiveRoomManage } from '../../apps/environment/liveRoomEnvironment';

export class LiveRoomManageService {

  private liveRoomManage: LiveRoomManage;

  constructor() {
    this.liveRoomManage = liveRoomManage;
  }

  async start(liveSettingDTO: LiveSettingDTO): Promise<void> {
    await this.liveRoomManage.start(liveSettingDTO);
  }

  async shutdown(): Promise<void> {
    await this.liveRoomManage.shutdown();
  }

  async check_connect(liveSettingDTO: LiveSettingDTO) {
    return this.liveRoomManage.check_connect(liveSettingDTO);
  }

  async restart(): Promise<void> {
    this.liveRoomManage.restart();
  }
}

