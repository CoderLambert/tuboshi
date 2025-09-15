import { useState } from 'react'
import { produce } from 'immer'
import { useGetState } from 'ahooks'
import type { ConversationItem } from '@/types/app'

const storageConversationIdKey = 'conversationIdInfo'

type ConversationInfoType = Omit<ConversationItem, 'inputs' | 'id'>
function useConversation() {
  const [conversationList, setConversationList] = useState<ConversationItem[]>([])
  const [currConversationId, doSetCurrConversationId, getCurrConversationId] = useGetState<string>('-1')
  // when set conversation id, we do not have set appId
  const setCurrConversationId = (id: string, appId: string, isSetToLocalStroge = true, newConversationName = '') => {
    // ✅ 输入验证
    if (!id || typeof id !== 'string') {
      console.warn('Invalid conversation ID:', id)
      throw new Error(`Invalid conversation ID: ${id}`)
    }

    // if (!appId || typeof appId !== 'string') {
    //   console.warn('Invalid app ID:', appId)
    //   throw new Error(`Invalid app ID: ${appId}`)
    // }

    // ✅ 特殊值检查
    const invalidValues = ['-1', 'undefined', 'null', '', 'NaN', 'undefined']
    const trimmedId = id.trim()

    if (invalidValues.includes(trimmedId)) {
      console.warn('Invalid conversation ID value:', trimmedId)
      // 允许-1作为新会话的标识，但记录警告
      if (trimmedId !== '-1') {
        throw new Error(`Invalid conversation ID value: ${trimmedId}`)
      }
    }

    doSetCurrConversationId(trimmedId)

    if (isSetToLocalStroge && trimmedId !== '-1') {
      try {
        let conversationIdInfo: any

        // ✅ 安全地解析localStorage数据
        try {
          const stored = globalThis.localStorage?.getItem(storageConversationIdKey)
          conversationIdInfo = stored ? JSON.parse(stored) : {}
        }
        catch (parseError) {
          console.warn('Failed to parse conversation ID info from localStorage:', parseError)
          conversationIdInfo = {}
        }

        // ✅ 验证数据结构
        if (typeof conversationIdInfo !== 'object' || conversationIdInfo === null) {
          console.warn('Invalid conversationIdInfo structure, resetting')
          conversationIdInfo = {}
        }

        conversationIdInfo[appId] = trimmedId

        // ✅ 验证存储的数据结构
        if (typeof conversationIdInfo === 'object' && conversationIdInfo !== null) {
          globalThis.localStorage?.setItem(storageConversationIdKey, JSON.stringify(conversationIdInfo))
        }
        else {
          console.warn('Invalid conversationIdInfo structure after update, resetting')
          globalThis.localStorage?.setItem(storageConversationIdKey, JSON.stringify({ [appId]: trimmedId }))
        }
      }
      catch (error) {
        console.error('Failed to save conversation ID to localStorage:', error)

        // ✅ 尝试清理并重新设置
        try {
          globalThis.localStorage?.removeItem(storageConversationIdKey)
          globalThis.localStorage?.setItem(storageConversationIdKey, JSON.stringify({ [appId]: trimmedId }))
        }
        catch (cleanupError) {
          console.error('Failed to recover localStorage:', cleanupError)
        }
      }
    }
  }

  const getConversationIdFromStorage = (appId: string) => {
    try {
      // ✅ 输入验证
      if (!appId || typeof appId !== 'string') {
        console.warn('Invalid app ID in getConversationIdFromStorage:', appId)
        return null
      }

      let conversationIdInfo: any

      // ✅ 安全地解析localStorage数据
      try {
        const stored = globalThis.localStorage?.getItem(storageConversationIdKey)
        conversationIdInfo = stored ? JSON.parse(stored) : {}
      }
      catch (parseError) {
        console.warn('Failed to parse conversation ID info from localStorage:', parseError)
        return null
      }

      // ✅ 验证数据结构
      if (typeof conversationIdInfo !== 'object' || conversationIdInfo === null) {
        console.warn('Invalid conversationIdInfo structure in getConversationIdFromStorage')
        return null
      }

      const id = conversationIdInfo[appId]

      // ✅ 验证返回的ID
      if (!id || typeof id !== 'string') {
        console.warn('Invalid conversation ID retrieved from storage for app:', appId)
        return null
      }

      // ✅ 特殊值检查
      const invalidValues = ['undefined', 'null', '', 'NaN']
      if (invalidValues.includes(id.trim())) {
        console.warn('Invalid conversation ID value from storage:', id)
        return null
      }

      return id
    }
    catch (error) {
      console.error('Error in getConversationIdFromStorage:', error)
      return null
    }
  }

  const isNewConversation = currConversationId === '-1'

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
  const currInputs = isNewConversation ? newConversationInputs : existConversationInputs
  const setCurrInputs = isNewConversation ? setNewConversationInputs : setExistConversationInputs

  // info is muted
  const [newConversationInfo, setNewConversationInfo] = useState<ConversationInfoType | null>(null)
  const [existConversationInfo, setExistConversationInfo] = useState<ConversationInfoType | null>(null)
  const currConversationInfo = isNewConversation ? newConversationInfo : existConversationInfo

  return {
    conversationList,
    setConversationList,
    currConversationId,
    getCurrConversationId,
    setCurrConversationId,
    getConversationIdFromStorage,
    isNewConversation,
    currInputs,
    newConversationInputs,
    existConversationInputs,
    resetNewConversationInputs,
    setCurrInputs,
    currConversationInfo,
    setNewConversationInfo,
    setExistConversationInfo,
  }
}

export default useConversation
