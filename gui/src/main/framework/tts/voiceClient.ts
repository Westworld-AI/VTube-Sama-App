import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import axios from 'axios';
import fs from 'fs';

export abstract class BaseVoiceClient {

  public abstract synthesis(voiceId: string, text: string, outputPath: string, config: Map<string, string>): Promise<String>;

}

export class EdgeTTSVoiceClient extends BaseVoiceClient {
  async synthesis(voiceId: string, text: string, outputPath: string, config: Map<string, string>): Promise<String> {

    let voiceName = voiceId;
    if (!voiceName) {
      voiceName = 'zh-CN-XiaoyiNeural';
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS);

    // 生成一个基于 uuid 的唯一文件名
    const uniqueFileName = `example_audio_${uuidv4()}.webm`;
    const filePath = path.join(outputPath, uniqueFileName);

    // 将合成的语音保存到文件
    await tts.toFile(filePath, text);
    return Promise.resolve(uniqueFileName);
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


