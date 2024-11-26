interface OCRText {
  context: string;
  createTime: Date;
}

class OCRTextStorage {
  private texts: OCRText[];
  private maxStorage: number;

  constructor(maxStorage: number = 10) {
    this.texts = [];
    this.maxStorage = maxStorage; // 设置最大存储条数
  }

  // 上传文本
  push(context: string): void {
    const newText = {context, createTime: new Date()};

    // 如果当前文本数量已达到最大限制，移除最旧的文本
    if (this.texts.length >= this.maxStorage) {
      this.texts.shift(); // 移除最旧的文本
    }

    this.texts.push(newText); // 添加新文本
  }

  // 获取最新的OCR文本
  getLatest(): OCRText | null {
    if (this.texts.length === 0) {
      return null; // 如果没有文本，返回 null
    }
    return this.texts[this.texts.length - 1]; // 返回最新的文本
  }

  getNewest(n: number): OCRText[] {
    if (n <= 0) {
      return []; // 如果x小于等于0，返回空数组
    }
    return this.texts.slice(-n); // 返回最新的x条文本
  }
}

// 示例用法
const ocrStorage = new OCRTextStorage();
export default ocrStorage;
