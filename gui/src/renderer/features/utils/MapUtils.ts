export function findKeyByValue(map: Map<string, string>, searchValue: string): string | undefined {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) {
      return key;
    }
  }
  return undefined; // 如果找不到，则返回undefined
}
