import {VoiceDrive} from "../../framework/tts/voiceClient";
import {VoiceOptionDTO, VoiceSynthesisDTO} from "../dto/voiceDTO";
import {FileService} from "./fileService";
import path from "path";
import {app} from "electron";
import fs from "fs";


const EDGE_TTS_OPTIONS = [
  new VoiceOptionDTO("zh-CN-XiaoxiaoNeural", "xiaoxiao"),
  new VoiceOptionDTO("zh-CN-XiaoyiNeural", "xiaoyi"),
  new VoiceOptionDTO("zh-CN-YunjianNeural", "yunjian"),
  new VoiceOptionDTO("zh-CN-YunxiNeural", "yunxi"),
  new VoiceOptionDTO("zh-CN-YunxiaNeural", "yunxia"),
  new VoiceOptionDTO("zh-CN-YunyangNeural", "yunyang"),
  new VoiceOptionDTO("zh-CN-liaoning-XiaobeiNeural", "xiaobei"),
  new VoiceOptionDTO("zh-CN-shaanxi-XiaoniNeural", "xiaoni"),
  new VoiceOptionDTO("zh-HK-HiuGaaiNeural", "hiugaai"),
  new VoiceOptionDTO("zh-HK-HiuMaanNeural", "hiumaan"),
  new VoiceOptionDTO("zh-HK-WanLungNeural", "wanlung"),
  new VoiceOptionDTO("zh-TW-HsiaoChenNeural", "hsiaochen"),
  new VoiceOptionDTO("zh-TW-HsiaoYuNeural", "hsioayu"),
  new VoiceOptionDTO("zh-TW-YunJheNeural", "yunjhe"),
]

const GPT_SO_VITS_OPTIONS = [
  new VoiceOptionDTO("muxue", "沐雪"),
]

export class VoiceService {

  voiceDrive: VoiceDrive
  fileService: FileService

  constructor() {
    this.voiceDrive = new VoiceDrive();
    this.fileService = new FileService();
  }

  async getEdgeTTsOptions(): Promise<VoiceOptionDTO[]> {
    return EDGE_TTS_OPTIONS;
  }

  async getGptSoVitsOptions(): Promise<VoiceOptionDTO[]> {
    return GPT_SO_VITS_OPTIONS;
  }

  async synthesis(voiceSynthesisDTO: VoiceSynthesisDTO): Promise<String> {
    const uploadDir = this.getMediaPath();
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {recursive: true});
    }
    return this.voiceDrive.synthesis( 
      voiceSynthesisDTO.voiceType,
      voiceSynthesisDTO.voiceId,
      voiceSynthesisDTO.text,
      uploadDir,
      voiceSynthesisDTO.config);
  }

  private getMediaPath() {
    const uploadDir = path.join(app.getPath('userData'), 'media');
    return uploadDir;
  }

  async deleteVoiceFile(filePath: string): Promise<boolean> {
    if (filePath) {
      const fileName = filePath.replace("mediafile://", "");
      filePath = path.join(this.getMediaPath(), fileName)
      return await this.fileService.delete(filePath);
    } else {
      return false;
    }
  }

}
