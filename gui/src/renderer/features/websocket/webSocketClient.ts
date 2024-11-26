import * as Webstomp from 'webstomp-client';

export default class WebSocketClient {
  private client: Webstomp.Client;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 2000;
  private sessionId: string;

  constructor(
    private url: string,
    private onMessageReceived: (msg: string) => void,
    private onErrorOccurred?: (error: CloseEvent | Webstomp.Frame) => void
  ) {
    // this.sessionId = this.generateSessionId();
    this.sessionId = 'localhost';
    this.connect();
  }

  private connect = (): void => {
    const socket = new WebSocket(this.url);
    this.client = Webstomp.over(socket, { debug: false });

    // Headers that may be required by the server for connection. E.g., Authorization header
    const headers: Webstomp.Headers = {}; // You may need to populate this with relevant headers

    this.client.connect(
      headers,
      (frame) => {
        console.log('connect success');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.subscribeToTopic(`/user/${this.sessionId}/queue/reply`);
      },
      (error) => {
        this.connected = false;
        // Error callback; handle both CloseEvent and Frame
        if ('code' in error) {
          // It's a CloseEvent
          this.onErrorOccurred && this.onErrorOccurred(error);
        } else {
          // It's a Frame, with error details
          this.onErrorOccurred && this.onErrorOccurred(new CloseEvent(error.headers.message));
        }
        this.retryConnect();
      }
    );
  };

  private subscribeToTopic = (destination: string): void => {
    this.client.subscribe(destination, (message: Webstomp.Message) => {
      this.onMessageReceived(message.body);
    });
  };

  private retryConnect = (): void => {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectInterval);
    }
  };

  public sendMessage = (destination: string, message: string): void => {
    if (this.connected) {
      this.client.send(destination, message, {
        'content-type': 'text/plain',
        'session-id': this.sessionId
      });
    }
  };

  public disconnect = (): void => {
    if (this.connected) {
      this.client.disconnect(() => {
        this.connected = false;
      });
    }
  };

  private generateSessionId = (): string => {
    // 使用Crypto API生成安全随机数
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    const part1 = array[0].toString(16).padStart(8, '0');
    const part2 = array[1].toString(16).padStart(8, '0');
    const part3 = array[2].toString(16).padStart(8, '0');
    const part4 = array[3].toString(16).padStart(8, '0');
    return `${part1}-${part2}-${part3}-${part4}`;
  };

}
