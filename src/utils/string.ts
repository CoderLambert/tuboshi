const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'
export function randomString(length: number) {
  let result = ''
  for (let i = length; i > 0; --i) { result += chars[Math.floor(Math.random() * chars.length)] }
  return result
}

// ✅ 新增：JSON 修复函数
export function tryRepairJson(jsonStr: string): string | null {
  try {
    // 尝试直接解析
    JSON.parse(jsonStr)
    return jsonStr
  }
  catch (e) {
    console.log('Attempting to repair JSON:', jsonStr.substring(0, 100))

    // 常见修复策略
    let repaired = jsonStr.trim()

    // 1. 修复字符串中的控制字符（主要问题）
    // 在字符串内部找到未转义的控制字符并转义它们
    // 首先确保已转义的字符不会被重复转义
    repaired = repaired.replace(/"(\\.|[^"\\])*"/g, (match) => {
      // 先处理已经转义过的字符（以反斜杠开头的）
      const processedMatch = match.replace(/\\([nrtbfv])/g, (_, p1) => {
        // 将已转义的字符替换为对应的字符
        const charMap: Record<string, string> = {
          n: '\n',
          r: '\r',
          t: '\t',
          b: '\b',
          f: '\f',
          v: '\v',
        }
        return charMap[p1] || p1
      })

      // 对处理后的字符串内容进行转义处理
      return processedMatch
          // 处理特殊控制字符
          .replace(/([\n\r\t\b\f\v])/g, (char) => {
            const escapeMap: Record<string, string> = {
              '\n': '\\n',
              '\r': '\\r',
              '\t': '\\t',
              '\b': '\\b',
              '\f': '\\f',
              '\v': '\\v',
            }
            return escapeMap[char]
          })
          // 处理其他控制字符（通过字符码判断，避免不安全的正则表达式）
          .replace(/./g, (char) => {
            const code = char.charCodeAt(0)
            // 检查是否为控制字符（除了已处理的常见控制字符）
            if ((code >= 0x00 && code <= 0x08) || (code >= 0x0E && code <= 0x1F) || code === 0x7F) {
              const hex = code.toString(16).padStart(4, '0')
              return `\\u${hex}`
            }
            return char
          })
    })

    // 2. 移除末尾的逗号
    repaired = repaired.replace(/,\s*([}\]])/g, '$1')

    // 3. 修复未结束的字符串
    const stringMatches = repaired.match(/"/g)
    if (stringMatches && stringMatches.length % 2 === 1) {
      // 奇数个引号，添加缺失的引号
      repaired += '"'
    }

    // 4. 修复缺失的闭合括号
    const openBraces = (repaired.match(/{/g) || []).length
    const closeBraces = (repaired.match(/}/g) || []).length
    const openBrackets = (repaired.match(/\[/g) || []).length
    const closeBrackets = (repaired.match(/\]/g) || []).length

    for (let i = 0; i < openBraces - closeBraces; i++) {
      repaired += '}'
    }
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      repaired += ']'
    }

    console.log('Repaired JSON:', repaired.substring(0, 100))

    try {
      JSON.parse(repaired)
      return repaired
    }
    catch (e2) {
      console.warn('JSON repair failed:', e2)
      return null
    }
  }
}
