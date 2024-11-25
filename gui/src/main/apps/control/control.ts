import { PriorityQueueEmitter } from '../../framework/queue/queue';
import {
  LiveRoomEnvironment,
  liveRoomEnvironment,
  LiveRoomManage,
  liveRoomManage
} from '../environment/liveRoomEnvironment';
import { LiveEvent, LiveEventTypeEnum } from '../../framework/live/base';

enum ControlTypeEnum {
  CHAT = 'chat',
  ACTION = 'action',
}

enum ActionEnum {

  //打招呼
  ACT_SAY_HELLO = 'act_say_hello',

  //卖萌
  ACT_ACT_CUTE = 'act_act_cute',

}

class ControlTask {

  type: ControlTypeEnum;
  data: any;

  constructor(type: ControlTypeEnum, data: any) {
    this.type = type;
    this.data = data;
  }
}

function executeWithProbability<T>(probability: number, action: () => T): T | null {
  if (Math.random() < probability) {
    return action();
  } else {
    return null;
  }
}


class ControlTaskManage {

  /**
   * 控制任务优先队列，用于存储和管理控制任务。
   */
  private controlTaskPriorityQueue: PriorityQueueEmitter<ControlTask>;

  /**
   * 现场环境对象，提供当前直播间的基本信息。
   */
  private liveRoomEnvironment: LiveRoomEnvironment;

  /**
   * 现场管理对象，用于处理当前直播间的各种业务逻辑。
   */
  private liveRoomManage: LiveRoomManage;

  private liveEventSubscribe: LiveEventSubscribe;

  constructor(liveRoomEnvironment: LiveRoomEnvironment,
              liveRoomManage: LiveRoomManage) {

    this.controlTaskPriorityQueue = new PriorityQueueEmitter<ControlTask>();
    this.liveRoomEnvironment = liveRoomEnvironment;
    this.liveRoomManage = liveRoomManage;
    this.liveEventSubscribe = new LiveEventSubscribe();

    // 监听弹幕生成消息
    this.liveRoomEnvironment.subscribe((liveEvent) => {
      const controlTask = this.liveEventSubscribe.handler(liveEvent);
      console.log('send liveEvent', liveEvent);
      if (controlTask) {
        this.controlTaskPriorityQueue.enqueue(controlTask, liveEvent.priority);
      }
    });
  }

  subscribe(handler: (controlTask: ControlTask) => void) {
    this.controlTaskPriorityQueue.subscribe(handler);
  }

}

class LiveEventSubscribe {
  handler(liveEvent: LiveEvent): ControlTask {
    if (liveEvent.type === LiveEventTypeEnum.INTERACT_WORD) {
      const result = executeWithProbability(1 / 5, () => {
        // 这里放入需要有概率执行的代码
        const content = `欢迎${liveEvent.user_name}进入直播间，亲爱的你来啦`;
        liveEvent.content = content;
        liveEvent.attribute = {
          action: ActionEnum.ACT_SAY_HELLO
        };
        return new ControlTask(ControlTypeEnum.CHAT, liveEvent);
      });
    } else {
      liveEvent.content = liveEvent.content.replace(/\[/g, '');
      return new ControlTask(ControlTypeEnum.CHAT, liveEvent);
    }
  }
}


const controlTaskManage = new ControlTaskManage(liveRoomEnvironment, liveRoomManage);
export { controlTaskManage };

