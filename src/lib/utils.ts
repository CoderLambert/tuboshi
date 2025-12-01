import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { QACategoryArraySchema } from './validation'

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

/**
 * 使用 Zod 校验并转换 faqContent
 * @param faqContent 待转换的数据
 * @returns 转换后的数组或空数组
 */
export function transformFaqContentWithZod(faqContent: unknown): Array<Record<string, string[]>> {
  const result = QACategoryArraySchema.safeParse(faqContent)

  if (!result.success) {
    return []
  }

  return result.data.map(categoryItem => ({
    [categoryItem.questionCategory]: categoryItem.qaItemList.map(item => item.question),
  }))
}

export function testTransformFaqContentWithZod() {
  const faqContent = [
    {
      questionCategory: '问题分类1',
      qaItemList: [
        {
          question: '问题1',
          answer: '答案1',
        },
        {
          question: '问题2',
          answer: '答案2',
        },
      ],
    },
  ]

  console.log(transformFaqContentWithZod(faqContent))

  const faqContent2 = ['问题1', '问题2']
  console.log(transformFaqContentWithZod(faqContent2))
}
