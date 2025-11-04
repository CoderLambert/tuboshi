import { useState } from 'react'
import { produce } from 'immer'
import { useGetState } from 'ahooks'
import type { ConversationItem } from '@/types/app'
import {
  type ConversationInfoType,
  getConversationIdFromStorage as getFromStorage,
  isNewConversation,
  saveConversationIdToStorage,
  validateAppId,
  validateConversationId,
  validateNewConversationParams,
  validateRenameConversationParams,
  validateSwitchConversationParams,
} from '@/lib/validation'
function useConversation() {
  const [conversationList, setConversationList] = useState<ConversationItem[]>([])
  const [currConversationId, doSetCurrConversationId, getCurrConversationId] = useGetState<string>('-1')
  // when set conversation id, we do not have set appId
  const setCurrConversationId = (id: unknown, appId: unknown, isSetToLocalStroge = true, _newConversationName = '') => {
    console.log(`id ${id} - appId ${appId}`)

    try {
      // 使用 Zod 验证会话ID
      const validatedId = validateConversationId(id)
      const validatedAppId = validateAppId(appId) // 允许无效appId，返回空字符串

      doSetCurrConversationId(validatedId)
      console.log(`trimmedId - ${validatedId} - ${getCurrConversationId()}`)

      // 保存到localStorage
      if (isSetToLocalStroge && validatedId !== '-1' && validatedAppId) {
        saveConversationIdToStorage(validatedAppId, validatedId)
      }
    }
    catch (error) {
      console.error('Failed to set conversation ID:', error)
      throw error
    }
  }

  const getConversationIdFromStorage = (appId: unknown) => {
    return getFromStorage(appId)
  }

  const isNewConversationFlag = isNewConversation(currConversationId)

  // input can be updated by user
  const [newConversationInputs, setNewConversationInputs] = useState<Record<string, any> | null>(null)
  const resetNewConversationInputs = () => {
    if (!newConversationInputs) { return }
    setNewConversationInputs(produce(newConversationInputs, (draft) => {
      Object.keys(draft).forEach((key) => {
        draft[key] = ''
      })
    }))
  }
  const [existConversationInputs, setExistConversationInputs] = useState<Record<string, any> | null>(null)

  // 这里正常是需要用户填写表单的， 但在嵌入app中这些表单数据已经由 app 初始化完成，直接从  appStore 中获取
  const currInputs = isNewConversationFlag ? newConversationInputs : existConversationInputs
  const setCurrInputs = isNewConversationFlag ? setNewConversationInputs : setExistConversationInputs

  // info is muted
  const [newConversationInfo, setNewConversationInfo] = useState<ConversationInfoType | null>(null)
  const [existConversationInfo, setExistConversationInfo] = useState<ConversationInfoType | null>(null)
  const currConversationInfo = isNewConversationFlag ? newConversationInfo : existConversationInfo

  // 新增：切换到指定会话
  const switchToConversation = (conversationId: unknown, appId: unknown) => {
    try {
      const params = validateSwitchConversationParams({ conversationId, appId })

      if (params.conversationId === currConversationId) {
        return // 已经是当前会话，无需切换
      }

      console.log(`Switching from conversation ${currConversationId} to ${params.conversationId}`)
      setCurrConversationId(params.conversationId, params.appId, true)
    }
    catch (error) {
      console.error('Failed to switch conversation:', error)
      throw error
    }
  }

  // 新增：创建新会话
  const createNewConversation = (appId: unknown) => {
    try {
      const params = validateNewConversationParams({ appId })
      console.log('Creating new conversation')
      setCurrConversationId('-1', params.appId, true)
      resetNewConversationInputs()

      // 重置新会话信息
      setNewConversationInfo({
        name: params.name,
        introduction: params.introduction,
        suggested_questions: params.suggested_questions,
      })
    }
    catch (error) {
      console.error('Failed to create new conversation:', error)
      throw error
    }
  }

  // 新增：删除会话（仅本地操作，实际删除需要调用API）
  const deleteConversationFromList = (conversationId: string) => {
    setConversationList(prev => prev.filter(conv => conv.id !== conversationId))

    // 如果删除的是当前会话，切换到第一个可用会话或新会话
    if (conversationId === currConversationId) {
      const remainingConversations = conversationList.filter(conv => conv.id !== conversationId)
      if (remainingConversations.length > 0) {
        switchToConversation(remainingConversations[0].id, '') // 这里需要传入正确的appId
      }
      else {
        createNewConversation('') // 这里需要传入正确的appId
      }
    }
  }

  // 新增：重命名会话（仅本地操作，实际重命名需要调用API）
  const renameConversationInList = (conversationId: unknown, newName: unknown) => {
    try {
      const params = validateRenameConversationParams({ conversationId, newName })

      setConversationList(prev =>
        produce(prev, (draft) => {
          const conversation = draft.find(conv => conv.id === params.conversationId)
          if (conversation) {
            conversation.name = params.newName
          }
        }),
      )
    }
    catch (error) {
      console.error('Failed to rename conversation:', error)
      throw error
    }
  }

  return {
    conversationList,
    setConversationList,
    currConversationId,
    getCurrConversationId,
    setCurrConversationId,
    getConversationIdFromStorage,
    isNewConversation: isNewConversationFlag,
    currInputs,
    newConversationInputs,
    existConversationInputs,
    resetNewConversationInputs,
    setCurrInputs,
    currConversationInfo,
    setNewConversationInfo,
    setExistConversationInfo,
    // 新增的方法
    switchToConversation,
    createNewConversation,
    deleteConversationFromList,
    renameConversationInList,
  }
}

export default useConversation
