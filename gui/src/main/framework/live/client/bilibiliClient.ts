import { BiliLive } from 'bili-live-listener';
import { BaseLiveClient, BaseLiveListener, LiveEvent, LiveEventPriorityEnum, LiveEventTypeEnum } from '../base';
import axios from 'axios';
import { LiveRoomEnvironment } from 'main/apps/environment/liveRoomEnvironment';

export class BilibiliClient extends BaseLiveClient {

  private biliLive: BiliLive | null;
  private roomId: number;
  private cookie: string;
  private liveRoomEnvironment: LiveRoomEnvironment;

  constructor(roomId: number, cookie: string, liveRoomEnvironment: LiveRoomEnvironment) {
    super();
    this.roomId = roomId;
    this.cookie = cookie;
    this.biliLive = null;
    this.liveRoomEnvironment = liveRoomEnvironment;
  }

  async start(): Promise<void> {

    const roomConf = await getRoomConf(this.roomId, this.cookie);
    const uid = await getLoginedUid(this.cookie);
    this.biliLive = new BiliLive(this.roomId, {
      key: roomConf.key,
      uid: uid
    });

    new BilibiliLiveListener(this.biliLive, this.liveRoomEnvironment);
  }

  async check_connect(): Promise<boolean> {
    try {
      const uid = await getLoginedUid(this.cookie);
      return uid != null;
    } catch (e) {
      console.error('check_connect error:', e);
      return false;
    }
  }

  shutdown(): void {
    if (!this.biliLive) {
      console.warn('biliLive is null');
      return;
    }

    this.biliLive.close();
    this.biliLive = null;
  }

  restart(): void {

    if (!this.biliLive) {
      console.warn('biliLive is null');
      return;
    }

    this.shutdown();
    this.start();
  }

}

class BilibiliLiveListener extends BaseLiveListener {

  private biliLive: BiliLive;
  private liveRoomEnvironment: LiveRoomEnvironment;

  constructor(biliLive: BiliLive, liveRoomEnvironment: LiveRoomEnvironment) {
    super();
    this.biliLive = biliLive;
    this.liveRoomEnvironment = liveRoomEnvironment;

    this.biliLive.onDanmu(({ data }) => {
      const content = `${data.user.uname}：${data.content}`;
      this.on_danmaku({
        user_id: data.user.uid.toString(),
        user_name: data.user.uname,
        type: LiveEventTypeEnum.DANMAKU,
        content: content,
        priority: LiveEventPriorityEnum.DEFAULT_DANMAKU
      });
    });

    this.biliLive.onGift(({ data }) => {
      this.on_gift({
        user_id: data.user.uid.toString(),
        user_name: data.user.uname,
        type: LiveEventTypeEnum.GIFT,
        content: '',
        attribute: data,
        priority: LiveEventPriorityEnum.GIFT
      });
    });

    // this.biliLive.onInteract(({ data }) => {
    //   this.on_follow_live_room({
    //     user_id: data.user.uid.toString(),
    //     user_name: data.user.uname,
    //     type: EventType.FOLLOW_LIVE_ROOM,
    //     attribute: data
    //   });
    // });

    this.biliLive.onInteract(({ data }) => {
      this.on_interact_word({
        user_id: data.user.uid.toString(),
        user_name: data.user.uname,
        type: LiveEventTypeEnum.INTERACT_WORD,
        content: '',
        attribute: data,
        priority: LiveEventPriorityEnum.INTERACT_WORD
      });
    });

    this.biliLive.onRawMessage('LIKE_INFO_V3_CLICK', (message) => {
      console.log('LIKE_INFO_V3_CLICK:', message);
      // const data_info = message['data']['data'];
      // const user_name = data_info['uname'];
      // const user_id = data_info['uid'];
      // this.on_like_click({
      //   user_id: user_id,
      //   user_name: user_name,
      //   type: EventType.LIKE_CLICK
      // });
    });
  }

  on_danmaku(liveEvent: LiveEvent): void {
    this.liveRoomEnvironment.enqueue(liveEvent);
  }

  on_follow_live_room(liveEvent: LiveEvent): void {
    this.liveRoomEnvironment.enqueue(liveEvent);
  }

  on_gift(liveEvent: LiveEvent): void {
    this.liveRoomEnvironment.enqueue(liveEvent);
  }

  on_interact_word(liveEvent: LiveEvent): void {
    this.liveRoomEnvironment.enqueue(liveEvent);
  }

  on_like_click(liveEvent: LiveEvent): void {
    this.liveRoomEnvironment.enqueue(liveEvent);
  }
}


// 定义一个类型接口来更清晰地管理函数返回值
interface RoomIDs {
  longRoomId: number;
  shortRoomId: number;
}

interface RoomConf {
  key: string;
}

async function request(url: string, options?: any): Promise<any> {
  // 如果没有传入options对象，就创建一个新的对象
  if (!options) {
    options = {};
  }
  options.timeout = 15000;
  const response = await axios.get(url, options);
  return response.data;
}

async function getRoomId(roomId: string): Promise<RoomIDs> {
  const {
    data: {
      room_id: longRoomId,
      short_id: shortRoomId
    }
  } = await request(`https://api.live.bilibili.com/room/v1/Room/mobileRoomInit?id=${roomId}`);
  return { longRoomId, shortRoomId };
}

async function getRoomConf(roomId: number, cookie: string): Promise<RoomConf> {
  const {
    data: {
      token: key
    }
  } = await request(`https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo?id=${roomId}`, {
    headers: {
      'Connection': 'keep-alive',
      'Cookie': cookie
    }
  });
  return { key };
}

async function getLoginedUid(cookie: string): Promise<number> {
  const {
    data: {
      mid: uid
    }
  } = await request('https://api.bilibili.com/x/web-interface/nav', {
    headers: {
      'Connection': 'keep-alive',
      'Cookie': cookie
    }
  });
  return uid;
}
