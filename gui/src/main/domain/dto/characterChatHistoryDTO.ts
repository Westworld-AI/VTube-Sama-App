enum ChatHistorySourceEnum {
  Client,
  Bilibili,
  Douyin
}

export class CharacterChatHistoryDTO {
  id?: number;
  character_id?: number;
  source?: string;
  sender?: string;
  question?: string;
  answer?: string;
}

export class FindPageByCharacterIdDTO{
  characterId?: number;
  page?: number;
  pageSize?: number;
  order?: Record<string, "ASC" | "DESC">;
}

export class FindScrollReadDataDTO{
  characterId?: number;
  pageSize?: number;
}
