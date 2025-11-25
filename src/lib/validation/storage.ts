import { ConversationIdInfoSchema, ConversationIdSchema, AppIdSchema, type ConversationIdInfoType } from './schemas'

const STORAGE_KEY = 'conversationIdInfo'

/**
 * 安全解析localStorage数据
 * @param data - localStorage中的字符串数据
 * @returns 解析后的数据，失败时返回null
 */
export function safeParseStorageData(data: string | null): ConversationIdInfoType | null {
  if (!data) {
    return {}
  }

  try {
    const parsed = JSON.parse(data)
    const result = ConversationIdInfoSchema.safeParse(parsed)

    if (!result.success) {
      console.warn('Invalid conversationIdInfo structure in localStorage:', result.error.message)
      return {}
    }

    return result.data
  } catch (parseError) {
    console.warn('Failed to parse conversation ID info from localStorage:', parseError)
    return null
  }
}

/**
 * 验证存储数据
 * @param data - 要验证的数据
 * @returns 验证结果
 */
export function validateStorageData(data: unknown): { success: boolean; data?: ConversationIdInfoType; error?: string } {
  const result = ConversationIdInfoSchema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      error: result.error.message,
    }
  }

  return {
    success: true,
    data: result.data,
  }
}

/**
 * 从localStorage获取会话ID信息
 * @param appId - 应用ID
 * @returns 会话ID，获取失败时返回null
 */
export function getConversationIdFromStorage(appId: unknown): string | null {
  // 验证appId
  const appIdResult = AppIdSchema.safeParse(appId)
  if (!appIdResult.success) {
    console.warn('Invalid app ID in getConversationIdFromStorage:', appId)
    return null
  }

  const validatedAppId = appIdResult.data

  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY)
    const conversationIdInfo = safeParseStorageData(stored)

    if (!conversationIdInfo) {
      return null
    }

    const id = conversationIdInfo[validatedAppId]

    // 验证返回的ID
    if (!id) {
      console.warn('No conversation ID found in storage for app:', validatedAppId)
      return null
    }

    const idResult = ConversationIdSchema.safeParse(id)
    if (!idResult.success) {
      console.warn('Invalid conversation ID retrieved from storage for app:', validatedAppId, id)
      return null
    }

    // 新会话标识符不需要保存到localStorage，所以从存储中获取时应该忽略
    if (idResult.data === '-1') {
      return null
    }

    return idResult.data
  } catch (error) {
    console.error('Error in getConversationIdFromStorage:', error)
    return null
  }
}

/**
 * 保存会话ID到localStorage
 * @param appId - 应用ID
 * @param conversationId - 会话ID
 * @returns 是否保存成功
 */
export function saveConversationIdToStorage(appId: unknown, conversationId: unknown): boolean {
  // 验证输入参数
  const appIdResult = AppIdSchema.safeParse(appId)
  if (!appIdResult.success) {
    console.warn('Invalid app ID in saveConversationIdToStorage:', appId)
    return false
  }

  const conversationIdResult = ConversationIdSchema.safeParse(conversationId)
  if (!conversationIdResult.success) {
    console.warn('Invalid conversation ID in saveConversationIdToStorage:', conversationId)
    return false
  }

  const validatedAppId = appIdResult.data
  const validatedConversationId = conversationIdResult.data

  // 新会话标识符不需要保存到localStorage
  if (validatedConversationId === '-1') {
    return true
  }

  try {
    // 获取现有的会话ID信息
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY)
    let conversationIdInfo = safeParseStorageData(stored)

    if (!conversationIdInfo) {
      conversationIdInfo = {}
    }

    // 更新会话ID
    conversationIdInfo[validatedAppId] = validatedConversationId

    // 保存到localStorage
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(conversationIdInfo))
    return true
  } catch (error) {
    console.error('Failed to save conversation ID to localStorage:', error)

    // 尝试恢复策略
    return createStorageRecoveryStrategy(validatedAppId, validatedConversationId)
  }
}

/**
 * 创建localStorage恢复策略
 * @param appId - 应用ID
 * @param conversationId - 会话ID
 * @returns 是否恢复成功
 */
export function createStorageRecoveryStrategy(appId: string, conversationId: string): boolean {
  try {
    // 尝试清理并重新设置
    globalThis.localStorage?.removeItem(STORAGE_KEY)
    const newConversationIdInfo: ConversationIdInfoType = {
      [appId]: conversationId,
    }
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(newConversationIdInfo))
    return true
  } catch (cleanupError) {
    console.error('Failed to recover localStorage:', cleanupError)
    return false
  }
}

/**
 * 清除特定应用的会话ID
 * @param appId - 应用ID
 * @returns 是否清除成功
 */
export function clearConversationIdFromStorage(appId: unknown): boolean {
  const appIdResult = AppIdSchema.safeParse(appId)
  if (!appIdResult.success) {
    console.warn('Invalid app ID in clearConversationIdFromStorage:', appId)
    return false
  }

  const validatedAppId = appIdResult.data

  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY)
    const conversationIdInfo = safeParseStorageData(stored)

    if (!conversationIdInfo || !conversationIdInfo[validatedAppId]) {
      return true // 不存在数据，认为清除成功
    }

    // 删除特定应用的会话ID
    delete conversationIdInfo[validatedAppId]

    // 如果还有其他应用的数据，保存更新后的数据
    if (Object.keys(conversationIdInfo).length > 0) {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(conversationIdInfo))
    } else {
      // 如果没有其他数据，删除整个存储项
      globalThis.localStorage?.removeItem(STORAGE_KEY)
    }

    return true
  } catch (error) {
    console.error('Failed to clear conversation ID from storage:', error)
    return false
  }
}

/**
 * 清除所有会话ID数据
 * @returns 是否清除成功
 */
export function clearAllConversationIdFromStorage(): boolean {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear all conversation ID from storage:', error)
    return false
  }
}

/**
 * 获取所有存储的会话ID信息
 * @returns 会话ID信息对象
 */
export function getAllConversationIdFromStorage(): ConversationIdInfoType {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY)
    return safeParseStorageData(stored) || {}
  } catch (error) {
    console.error('Error in getAllConversationIdFromStorage:', error)
    return {}
  }
}