import ocrStorage from "../../framework/vision/OCRTextStorage";

export class VisionService {
  push(context: string): void {
    ocrStorage.push(context);
  }

  getLast(): string | undefined {
    const last = ocrStorage.getLatest();
    if (last) {
      return last.context;
    } else {
      return undefined;
    }
  }

  getNewest(number: number): string[] {
    const newest = ocrStorage.getNewest(number);
    if (newest) {
      return newest.map((item: any) => item.context);
    } else {
      return [];
    }
  }

}
