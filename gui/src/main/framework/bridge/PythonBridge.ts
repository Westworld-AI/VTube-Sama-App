import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

type MessageCallback = (message: any) => void;

class PythonBridge {
  private pythonProcess: ChildProcessWithoutNullStreams;
  private onMessageCallback?: MessageCallback;

  constructor(pythonScriptPath: string) {
    this.pythonProcess = spawn('python', [pythonScriptPath]);
    this.pythonProcess.stdout.setEncoding('utf8');

    this.pythonProcess.stdout.on('data', (data: string) => {
      try {
        const message = JSON.parse(data);
        if (this.onMessageCallback) {
          this.onMessageCallback(message);
        }
      } catch (error) {
        console.error('Error parsing JSON from python script:', error);
      }
    });

    this.pythonProcess.stderr.on('data', (data: string) => {
      console.error(`Python stderr: ${data}`);
    });
  }

  send(message: object): void {
    const messageString = JSON.stringify(message);
    this.pythonProcess.stdin.write(messageString + '\n');
  }

  onMessage(callback: MessageCallback): void {
    this.onMessageCallback = callback;
  }

  close(): void {
    this.pythonProcess.kill();
  }
}

export default PythonBridge;
