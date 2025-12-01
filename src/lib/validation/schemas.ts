import { z } from 'zod'

/**
 * 验证会话ID的Schema
 * 允许新会话标识符 "-1"，其他情况必须是非空字符串
 */
export const ConversationIdSchema = z.string()
  .min(1, 'Conversation ID cannot be empty')
  .refine((id) => {
    const trimmedId = id.trim()
    const invalidValues = ['undefined', 'null', '', 'NaN']
    return !invalidValues.includes(trimmedId) || trimmedId === '-1'
  }, {
    message: 'Invalid conversation ID value',
  })
  .transform(id => id.trim())

/**
 * 验证应用ID的Schema
 * 允许空字符串，用于某些不需要appId的场景
 */
export const AppIdSchema = z.string()
  .refine((appId) => {
    const trimmedId = appId.trim()
    const invalidValues = ['undefined', 'null', 'NaN']
    return !invalidValues.includes(trimmedId)
  }, {
    message: 'Invalid app ID value',
  })
  .transform(appId => appId.trim())

/**
 * 验证应用ID的Schema（严格模式，要求非空）
 * 用于需要有效appId的场景
 */
export const AppIdStrictSchema = z.string()
  .min(1, 'App ID cannot be empty')
  .refine((appId) => {
    const trimmedId = appId.trim()
    const invalidValues = ['undefined', 'null', '', 'NaN']
    return !invalidValues.includes(trimmedId)
  }, {
    message: 'App ID cannot be empty',
  })
  .transform(appId => appId.trim())

/**
 * localStorage中会话ID信息的Schema
 */
export const ConversationIdInfoSchema = z.record(z.string(), ConversationIdSchema)

/**
 * 会话项目的Schema（基于代码中的类型定义）
 */
export const ConversationItemSchema = z.object({
  id: ConversationIdSchema,
  name: z.string(),
  introduction: z.string().optional(),
  suggested_questions: z.array(z.string()).optional(),
  inputs: z.record(z.any()).optional(),
})

/**
 * 会话信息类型（排除inputs和id）
 */
export const ConversationInfoSchema = z.object({
  name: z.string(),
  introduction: z.string().optional(),
  suggested_questions: z.array(z.string()).optional(),
})

/**
 * 新会话创建参数Schema
 */
export const NewConversationParamsSchema = z.object({
  appId: AppIdSchema, // 允许空appId
  name: z.string().optional().default('新会话'),
  introduction: z.string().optional().default(''),
  suggested_questions: z.array(z.string()).optional().default([]),
})

/**
 * 会话切换参数Schema
 */
export const SwitchConversationParamsSchema = z.object({
  conversationId: ConversationIdSchema,
  appId: AppIdSchema, // 允许空appId
})

/**
 * 会话重命名参数Schema
 */
export const RenameConversationParamsSchema = z.object({
  conversationId: ConversationIdSchema,
  newName: z.string().min(1, 'New name cannot be empty'),
})

// Zod Schema 对应 QaItemList
export const QaItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
})

// Zod Schema 对应 QACategory
export const QACategorySchema = z.object({
  questionCategory: z.string(),
  qaItemList: z.array(QaItemSchema),
})

// 定义 faqContent 的期望格式（QACategory[]）
export const QACategoryArraySchema = z.array(QACategorySchema)

// 类型导出
export type ConversationIdType = z.infer<typeof ConversationIdSchema>
export type AppIdType = z.infer<typeof AppIdSchema>
export type AppIdStrictType = z.infer<typeof AppIdStrictSchema>
export type ConversationIdInfoType = z.infer<typeof ConversationIdInfoSchema>
export type ConversationItemType = z.infer<typeof ConversationItemSchema>
export type ConversationInfoType = z.infer<typeof ConversationInfoSchema>
export type NewConversationParamsType = z.infer<typeof NewConversationParamsSchema>
export type SwitchConversationParamsType = z.infer<typeof SwitchConversationParamsSchema>
export type RenameConversationParamsType = z.infer<typeof RenameConversationParamsSchema>
export type QACategoryArrayType = z.infer<typeof QACategoryArraySchema>
export type QACategoryType = z.infer<typeof QACategorySchema>
export type QaItemType = z.infer<typeof QaItemSchema>
