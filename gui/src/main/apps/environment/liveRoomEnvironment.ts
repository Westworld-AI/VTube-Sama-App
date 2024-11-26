import { PriorityQueueEmitter } from '../../framework/queue/queue';
import { BaseLiveClient, LiveEvent } from '../../framework/live/base';
import { LiveSettingDTO } from '../../domain/dto/systemSettingDTO';
import { BilibiliClient } from '../../framework/live/client/bilibiliClient';

class LiveRoomManage {

  private liveClient: BaseLiveClient | null | undefined;
  private liveRoomEnvironment: LiveRoomEnvironment;
  private isStarting: boolean;
  private waitingResolve: (() => void) | null;


  constructor(liveRoomEnvironment: LiveRoomEnvironment) {
    this.liveRoomEnvironment = liveRoomEnvironment;
    this.isStarting = false;
    this.waitingResolve = null;
  }

  init(liveSettingDTO: LiveSettingDTO): void {
    // Check if the live client is already initialized, and shut it down if so.
    if (this.liveClient) {
      // Ensure the shutdown method exists before calling it.
      this.liveClient.shutdown();
      this.liveClient = null;
    }

    // Validate the live setting DTO
    if (!liveSettingDTO) {
      throw new Error('Live setting DTO is required');
    }
    if (!liveSettingDTO.live_type || !['bilibili', 'douyu'].includes(liveSettingDTO.live_type)) {
      throw new Error('Invalid live type');
    }

    // Check extended attributes
    if (liveSettingDTO.extended_attributes && !liveSettingDTO.extended_attributes['room_id']) {
      throw new Error('Room ID is required in extended attributes');
    }
    if (!liveSettingDTO.extended_attributes || !Object.keys(liveSettingDTO.extended_attributes).length) {
      throw new Error('Extended attributes are required');
    }

    // Initialize the live client based on the live type
    switch (liveSettingDTO.live_type) {
      case 'bilibili':
        const roomId = Number(liveSettingDTO.extended_attributes['room_id']);
        const cookie = liveSettingDTO.extended_attributes['cookie'];
        this.liveClient = new BilibiliClient(roomId, cookie, this.liveRoomEnvironment);
        break;
      case 'douyu':
        // TO DO: implement initialization for Douyu
        console.log('Initializing Douyu client');
        break;
      default:
        throw new Error(`Unsupported live type: ${liveSettingDTO.live_type}`);
    }
  }

  async start(liveSettingDTO: LiveSettingDTO) {

    // 如果由另一个进程正在开始，则等待
    while (this.isStarting) {
      await new Promise(resolve => this.waitingResolve = resolve);
    }

    try {
      this.isStarting = true;  // 设置锁的状态为true
      this.init(liveSettingDTO);
      await this.liveClient?.start();
      console.info('liveRoomManage.start ....');
    } finally {
      this.isStarting = false;  // 释放锁
      if (this.waitingResolve) {
        this.waitingResolve();  // 通知正在等待的进程
        this.waitingResolve = null;
      }
    }
  }

  async shutdown() {
    if (!this.liveClient) {
      console.warn('liveClient has not been initialized');
      return;
    }
    await this.liveClient.shutdown();
    console.info('liveRoomManage.shutdown ....');
  }

  async check_connect(liveSettingDTO: LiveSettingDTO) {
    this.init(liveSettingDTO);
    const res = this.liveClient?.check_connect();
    await this.shutdown();
    return res;
  }

  async restart() {
    if (!this.liveClient) {
      console.warn('liveClient has not been initialized');
      return;
    }
    await this.liveClient.restart();
  }

}

class LiveRoomEnvironment {

  private liveClientPriorityQueue: PriorityQueueEmitter<LiveEvent>;

  constructor() {
    this.liveClientPriorityQueue = new PriorityQueueEmitter<LiveEvent>();
  }

  enqueue(liveEvent: LiveEvent, priority: number) {
    this.liveClientPriorityQueue.enqueue(liveEvent, priority);
  }

  subscribe(handler: (liveEvent: LiveEvent) => void) {
    this.liveClientPriorityQueue.subscribe(handler);
  }

  unsubscribe(handler: (liveEvent: LiveEvent) => void) {
    this.liveClientPriorityQueue.unsubscribe(handler);
  }

}

const liveRoomEnvironment = new LiveRoomEnvironment();
const liveRoomManage = new LiveRoomManage(liveRoomEnvironment);
export {
  liveRoomEnvironment,
  liveRoomManage,
  LiveRoomManage,
  LiveRoomEnvironment
};
