enum LiveEventTypeEnum {
  DANMAKU = 'danmaku',
  FOLLOW_LIVE_ROOM = 'follow_live_room',
  GIFT = 'gift',
  INTERACT_WORD = 'interact_word',
  LIKE_CLICK = 'like_click',
}

enum LiveEventPriorityEnum {

  // 普通用户弹幕
  DEFAULT_DANMAKU = 3,

  // 关注直播间
  FOLLOW_LIVE_ROOM = 1,

  // 送礼
  GIFT = 1,

  // 关注直播间
  INTERACT_WORD = 2,

  // 点赞
  LIKE_CLICK = 4,
}

interface LiveEvent {

  /**
   * 用户ID
   */
  user_id: string;

  /**
   * 用户名称
   */
  user_name: string;

  /**
   * 事件类型
   */
  type: LiveEventTypeEnum;

  /**
   * 优先级
   */
  priority: LiveEventPriorityEnum;

  /**
   * 内容
   */
  content?: string;

  /**
   * 额外属性
   */
  attribute?: any;

}

abstract class BaseLiveClient {

  /**
   * 测试连通性
   */
  abstract check_connect(): Promise<boolean> ;

  /**
   * 开启监听
   */
  abstract start(): Promise<void>;

  /**
   * 关闭监听
   */
  abstract shutdown(): void;

  /**
   * 重启监听
   */
  abstract restart(): void;

}

abstract class BaseLiveListener {

  /**
   * 收到弹幕
   */
  abstract on_danmaku(liveEvent: LiveEvent): void;

  /**
   * 收到礼物
   */
  abstract on_gift(liveEvent: LiveEvent): void;

  /**
   * 进入直播间
   */
  abstract on_interact_word(liveEvent: LiveEvent): void;

  /**
   * 关注直播间
   */
  abstract on_follow_live_room(liveEvent: LiveEvent): void;

  /**
   * 点赞
   */
  abstract on_like_click(liveEvent: LiveEvent): void;

}

export { BaseLiveClient, BaseLiveListener, LiveEvent, LiveEventTypeEnum ,LiveEventPriorityEnum};
