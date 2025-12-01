import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 辅助函数：解析Android平台返回值
export const parseJsonStringResponse = (data: unknown) => {
  if (typeof data === 'object') { return data }
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    }
    catch {
      console.warn('[Android Bridge] 返回值解析失败，将返回原始字符串:', data)
      return data
    }
  }
  return data
}
