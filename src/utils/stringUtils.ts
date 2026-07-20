
// 去除多余的换行符，只保留单个换行
export function normalizeNewlines(str: string): string {
  return str.replace(/[\r\n]+/g, '\n')
}
