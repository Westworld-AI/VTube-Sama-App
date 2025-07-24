import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import axios from 'axios';
import fs from 'fs';
import { EdgeTTS } from './edge/edge-tts-fixed';

export abstract class BaseVoiceClient {

  public abstract synthesis(voiceId: string, text: string, outputPath: string, config: Map<string, string>): Promise<String>;

}

export class EdgeTTSVoiceClient extends BaseVoiceClient {
  async synthesis(voiceId: string, text: string, outputPath: string, config: Map<string, string>): Promise<String> {
    try {
      let voiceName = voiceId;
      if (!voiceName) {
        voiceName = 'zh-CN-XiaoyiNeural';
      }

      console.log("voiceName:", voiceName);

      // Extract language from voice name
      const lang = /([a-zA-Z]{2,5}-[a-zA-Z]{2,5}\b)/.exec(voiceName)?.[1];

      const tts = new EdgeTTS({
        voice: voiceName,
        lang,
        outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
        saveSubtitles: false,
        timeout: 30_000,
      });

      console.log(`Running with nodejs edge-tts service...`);

      // Generate unique filename
      const uniqueFileName = `example_audio_${uuidv4()}.mp3`;
      const filePath = path.join(outputPath, uniqueFileName);

      // Synthesize and save to file
      const audioBuffer = await tts.ttsPromise(text, {
        outputType: 'buffer',
        audioPath: filePath,
      }) as Buffer;

      // Write buffer to file
      await fs.promises.writeFile(filePath, audioBuffer);

      return Promise.resolve(uniqueFileName);
    } catch (error) {
      console.error('EdgeTTS synthesis error:', error);
      throw new Error(`EdgeTTS synthesis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export class GPTSoVITSVoiceClient extends BaseVoiceClient {

  async synthesis(voiceId: string, text: string, outputPath: string, config: Map<string, string>): Promise<String> {

    // 生成一个基于 uuid 的唯一文件名
    const uniqueFileName = `example_audio_${uuidv4()}.wav`;
    const filePath = path.join(outputPath, uniqueFileName);

    // 构建请求 URL
    const encodedText = encodeURIComponent(text); // 确保文本被正确编码
    const requestUrl = `http://127.0.0.1:8080/?text=${encodedText}`;

    try {
      // 使用 axios 发送 GET 请求
      const response = await axios({
        method: 'get',
        url: requestUrl,
        responseType: 'stream' // 重要：设置响应类型为 'stream' 以直接处理数据流
      });

      // 将响应数据流直接写入文件
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      // 返回一个新的 Promise，确保文件写入完成
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          resolve(uniqueFileName); // 成功时返回文件名
        });
        writer.on('error', reject); // 处理可能的写入错误
      });
    } catch (error) {
      // 处理请求错误
      console.warn(`GPTSoVITS Warn: ${error}`);
      // throw new Error(`GPTSoVITS: ${error}`);
    }
  }
}


export class VoiceDrive {

  private voiceClientMap: Map<string, BaseVoiceClient>;

  constructor() {
    this.voiceClientMap = new Map<string, BaseVoiceClient>([
      ['edge-tts', new EdgeTTSVoiceClient()],
      ['gpt-sovits', new GPTSoVITSVoiceClient()]
    ]);
  }

  async synthesis(voiceType: string, voiceId: string, text: string, outputPath: string, config: Map<string, string>): Promise<String> {
    const voiceClient = this.voiceClientMap.get(voiceType);
    if (!voiceClient) { // 注意这里应该用否定，确保llmClient存在
      // 如果找不到，立即返回一个rejected的Promise
      return Promise.reject('');
    }
    // 如果找到了，正常执行chat函数
    return voiceClient.synthesis(voiceId, text, outputPath, config);
  }

}


