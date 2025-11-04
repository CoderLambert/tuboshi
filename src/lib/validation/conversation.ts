import {
  AppIdSchema,
  type AppIdType,
  ConversationIdSchema,
  type ConversationIdType,
  ConversationInfoSchema,
  type ConversationInfoType,
  NewConversationParamsSchema,
  type NewConversationParamsType,
  RenameConversationParamsSchema,
  type RenameConversationParamsType,
  SwitchConversationParamsSchema,
  type SwitchConversationParamsType,
} from './schemas'

/**
 * 验证会话ID
 * @param id - 会话ID
 * @returns 验证后的会话ID
 */
export function validateConversationId(id: unknown): ConversationIdType {
  const result = ConversationIdSchema.safeParse(id)

  if (!result.success) {
    console.warn('Invalid conversation ID:', id, result.error.message)
    throw new Error(`Invalid conversation ID: ${id}`)
  }

  return result.data
}

/**
 * 验证应用ID
 * @param appId - 应用ID
 * @returns 验证后的应用ID
 */
export function validateAppId(appId: unknown): AppIdType {
  const result = AppIdSchema.safeParse(appId)

  if (!result.success) {
    console.warn('Invalid app ID:', appId, result.error.message)
    // 应用ID验证失败时不抛出异常，而是返回空字符串（保持原有逻辑）
    return '' as AppIdType
  }

  return result.data
}

/**
 * 验证应用ID（严格模式，抛出异常）
 * @param appId - 应用ID
 * @returns 验证后的应用ID
 */
export function validateAppIdStrict(appId: unknown): AppIdType {
  const result = AppIdSchema.safeParse(appId)

  if (!result.success) {
    console.warn('Invalid app ID:', appId, result.error.message)
    throw new Error(`Invalid app ID: ${appId}`)
  }

  return result.data
}

/**
 * 清理和标准化会话ID
 * @param id - 原始会话ID
 * @returns 清理后的会话ID
 */
export function sanitizeConversationId(id: unknown): string {
  try {
    return validateConversationId(id)
  }
  catch (error) {
    console.warn('Failed to validate conversation ID, returning default:', error)
    return '-1' // 默认返回新会话标识
  }
}

/**
 * 检查是否为新会话
 * @param conversationId - 会话ID
 * @returns 是否为新会话
 */
export function isNewConversation(conversationId: string): boolean {
  try {
    const validatedId = validateConversationId(conversationId)
    return validatedId === '-1'
  }
  catch {
    return false // 验证失败时认为不是新会话
  }
}

/**
 * 验证会话信息
 * @param info - 会话信息
 * @returns 验证后的会话信息
 */
export function validateConversationInfo(info: unknown): ConversationInfoType {
  const result = ConversationInfoSchema.safeParse(info)

  if (!result.success) {
    console.warn('Invalid conversation info:', info, result.error.message)
    throw new Error(`Invalid conversation info: ${JSON.stringify(info)}`)
  }

  return result.data
}

/**
 * 验证新会话创建参数
 * @param params - 创建参数
 * @returns 验证后的参数
 */
export function validateNewConversationParams(params: unknown): NewConversationParamsType {
  const result = NewConversationParamsSchema.safeParse(params)

  if (!result.success) {
    console.warn('Invalid new conversation params:', params, result.error.message)
    throw new Error(`Invalid new conversation params: ${JSON.stringify(params)}`)
  }

  return result.data
}

/**
 * 验证会话切换参数
 * @param params - 切换参数
 * @returns 验证后的参数
 */
export function validateSwitchConversationParams(params: unknown): SwitchConversationParamsType {
  const result = SwitchConversationParamsSchema.safeParse(params)

  if (!result.success) {
    console.warn('Invalid switch conversation params:', params, result.error.message)
    throw new Error(`Invalid switch conversation params: ${JSON.stringify(params)}`)
  }

  return result.data
}

/**
 * 验证会话重命名参数
 * @param params - 重命名参数
 * @returns 验证后的参数
 */
export function validateRenameConversationParams(params: unknown): RenameConversationParamsType {
  const result = RenameConversationParamsSchema.safeParse(params)

  if (!result.success) {
    console.warn('Invalid rename conversation params:', params, result.error.message)
    throw new Error(`Invalid rename conversation params: ${JSON.stringify(params)}`)
  }

  return result.data
}

/**
 * 快速检查会话ID是否有效（不抛出异常）
 * @param id - 会话ID
 * @returns 是否有效
 */
export function isValidConversationId(id: unknown): boolean {
  return ConversationIdSchema.safeParse(id).success
}

/**
 * 快速检查应用ID是否有效（不抛出异常）
 * @param appId - 应用ID
 * @returns 是否有效
 */
export function isValidAppId(appId: unknown): boolean {
  return AppIdSchema.safeParse(appId).success
}
