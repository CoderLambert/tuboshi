import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from '@/app/components/base/toast'
import { fetchChatList } from '@/services'
import { addFileInfos, sortAgentSorts } from '@/utils/tools'
import type { ChatItem } from '@/types/app'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import useConversation from './use-conversation'
import type { IConversationItem } from '@/types/app'
/**
 * 会话管理器配置
 */
export type ConversationManagerConfig = {
  appId?: string
  inited: boolean
  isResponding: boolean
  setChatList: (list: ChatItem[]) => void
  setHistoryMessages: (messages: ChatItem[]) => void
  setShowLoadHistoryButton: (show: boolean) => void
  setHasMoreHistory: (hasMore: boolean) => void
  setSuggestQuestionsAfterAnswer: (questions: string[]) => void
  setIsSwitchingConversation: (isSwitching: boolean) => void
  setExistConversationInfo: (info: any) => void
  setNewConversationInfo: (info: any) => void
  setCurrInputs: (inputs: any) => void
  resetNewConversationInputs: () => void
  setAppUnavailable: (unavailable: boolean) => void
  setIsUnknownReason: (unknown: boolean) => void
  setInited: (inited: boolean) => void
  setPromptConfig: (config: any) => void
  setVisionConfig: (config: any) => void
  setConversationList: (list: IConversationItem[]) => void
  setCurrConversationId: (id: string, appId: string, save?: boolean) => void
}

/**
 * 会话管理 Hook
 * 负责处理会话切换、创建等逻辑
 */
export function useConversationManager(config: ConversationManagerConfig) {
  const { t } = useTranslation()
  const { notify } = Toast
  const { useUserID } = useNativeBridge()
  const userInfo = useUserID()

  // 会话管理状态
  const [showConversationList, setShowConversationList] = useState(false)
  const [isSwitchingConversation, setIsSwitchingConversation] = useState(false)

  // 使用现有的 useConversation hook
  const {
    conversationList,
    setConversationList,
    currConversationId,
    getCurrConversationId,
    setCurrConversationId,
    isNewConversation,
    currConversationInfo,
    currInputs,
    newConversationInputs,
    resetNewConversationInputs,
    setCurrInputs,
    setNewConversationInfo,
    setExistConversationInfo,
    switchToConversation,
    createNewConversation,
    deleteConversationFromList,
    renameConversationInList,
  } = useConversation()

  // Ref 来跟踪是否应该跳过会话切换逻辑
  const shouldSkipConversationSwitch = useRef(false)

  // 会话切换处理
  const handleConversationSelect = useCallback((conversationId: string) => {
    const { appId } = config

    if (!appId) {
      notify({ type: 'error', message: 'App configuration not ready' })
      return
    }

    const conversation = conversationList.find(c => c.id === conversationId)
    console.log('Switching to conversation:', conversation?.name || 'New Conversation')

    switchToConversation(conversationId, appId)
    setShowConversationList(false)

    // 显示切换成功提示
    setTimeout(() => {
      Toast.notify({
        type: 'success',
        message: t('app.conversation.switchSuccess') || '已切换到会话',
      })
    }, 500)
  }, [config, conversationList, switchToConversation, notify, t])

  // 新建会话处理
  const handleNewConversation = useCallback(() => {
    const { appId } = config

    if (!appId) {
      notify({ type: 'error', message: 'App configuration not ready' })
      return
    }

    console.log('Creating new conversation')
    createNewConversation(appId)
    setShowConversationList(false)

    // 显示新建会话成功提示
    setTimeout(() => {
      Toast.notify({
        type: 'success',
        message: t('app.conversation.newChatCreated') || '已创建新会话',
      })
    }, 500)
  }, [config, createNewConversation, notify, t])

  // 删除会话处理
  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    try {
      console.log('Deleting conversation:', conversationId)

      // 从本地列表中移除会话
      deleteConversationFromList(conversationId)

      // 如果删除的是当前会话，切换到其他会话或创建新会话
      if (conversationId === currConversationId) {
        const remainingConversations = conversationList.filter(conv => conv.id !== conversationId)
        if (remainingConversations.length > 0) {
          handleConversationSelect(remainingConversations[0].id)
        }
        else {
          handleNewConversation()
        }
      }

      Toast.notify({
        type: 'success',
        message: t('app.conversation.deleteSuccess') || '会话删除成功',
      })
    }
    catch (error) {
      console.error('Failed to delete conversation:', error)
      Toast.notify({
        type: 'error',
        message: t('app.conversation.deleteFailed') || '删除会话失败',
      })
    }
  }, [currConversationId, conversationList, deleteConversationFromList, handleConversationSelect, handleNewConversation, t])

  // 重命名会话处理
  const handleRenameConversation = useCallback(async (conversationId: string, newName: string) => {
    try {
      console.log('Renaming conversation:', conversationId, 'to:', newName)

      // 更新本地列表中的会话名称
      renameConversationInList(conversationId, newName)

      Toast.notify({
        type: 'success',
        message: t('app.conversation.renameSuccess') || '会话重命名成功',
      })
    }
    catch (error) {
      console.error('Failed to rename conversation:', error)
      Toast.notify({
        type: 'error',
        message: t('app.conversation.renameFailed') || '重命名会话失败',
      })
    }
  }, [renameConversationInList, t])

  // 处理会话切换的核心逻辑
  const handleConversationSwitch = useCallback(async () => {
    const {
      inited,
      setChatList,
      setHistoryMessages,
      setShowLoadHistoryButton,
      setHasMoreHistory,
      setSuggestQuestionsAfterAnswer,
      setIsSwitchingConversation,
      setExistConversationInfo,
      setNewConversationInfo,
      setCurrInputs,
      resetNewConversationInputs,
    } = config

    console.log('handleConversationSwitch - currConversationId:', getCurrConversationId(), 'isNewConversation:', isNewConversation)
    if (!inited) { return }

    // 检查是否应该跳过会话切换逻辑
    if (shouldSkipConversationSwitch.current) {
      console.log('跳过会话切换逻辑 (shouldSkipConversationSwitch = true)')
      shouldSkipConversationSwitch.current = false
      return
    }

    // 开始会话切换
    setIsSwitchingConversation(true)

    // 清空当前聊天列表和历史消息
    setChatList([])
    setHistoryMessages([])
    setShowLoadHistoryButton(false)
    setHasMoreHistory(true)
    setSuggestQuestionsAfterAnswer([])

    try {
      if (!isNewConversation) {
        // 处理已存在的会话
        const conversation = conversationList.find(item => item.id === getCurrConversationId())
        if (!conversation) {
          console.warn('Conversation not found:', getCurrConversationId())
          return
        }

        console.log('Loading existing conversation:', conversation.name)

        // 更新会话输入参数
        const conversationInputs = conversation.inputs || {}
        setCurrInputs(conversationInputs)

        // 更新会话信息
        setExistConversationInfo({
          name: conversation.name || t('app.chat.newChatDefaultName'),
          introduction: conversation.introduction || '',
          suggested_questions: conversation.suggested_questions || [],
        })

        // 加载该会话的消息
        if (!config.isResponding) {
          try {
            console.log('Fetching messages for conversation:', getCurrConversationId())
            const res = await fetchChatList(getCurrConversationId(), undefined, 5)
            const { data, has_more } = res

            console.log('Loaded messages:', data.length, 'has_more:', has_more)

            const newChatList: ChatItem[] = generateNewChatListWithOpenStatement(
              conversation.introduction || '',
              conversationInputs,
            )

            data.forEach((item: any) => {
              newChatList.push({
                id: `question-${item.id}`,
                content: item.query,
                isAnswer: false,
                message_files: item.message_files?.filter((file: any) => file.belongs_to === 'user') || [],
              })
              newChatList.push({
                id: item.id,
                content: item.answer,
                agent_thoughts: addFileInfos(
                  item.agent_thoughts ? sortAgentSorts(item.agent_thoughts) : item.agent_thoughts,
                  item.message_files,
                ),
                feedback: item.feedback,
                isAnswer: true,
                message_files: item.message_files?.filter((file: any) => file.belongs_to === 'assistant') || [],
              })
            })

            setChatList(newChatList)
            setHasMoreHistory(has_more)
            setShowLoadHistoryButton(has_more)

            console.log('Successfully loaded conversation messages')
          }
          catch (error) {
            console.error('Failed to load conversation messages:', error)
            // 如果加载失败，至少显示开场白
            setChatList(generateNewChatListWithOpenStatement(conversation.introduction || '', conversationInputs))
            setHasMoreHistory(false)
            setShowLoadHistoryButton(false)

            // 显示错误提示
            Toast.notify({
              type: 'error',
              message: t('app.errorMessage.historyLoadFailed') || '加载历史消息失败',
            })
          }
        }
      }
      else {
        // 处理新会话
        console.log('Creating new conversation')

        // 重置新会话输入参数
        if (newConversationInputs) {
          setCurrInputs(newConversationInputs)
        }

        // 重置新会话信息
        setNewConversationInfo({
          name: t('app.chat.newChatDefaultName'),
          introduction: '',
          suggested_questions: [],
        })

        // 清空聊天列表，显示空白状态
        setChatList(generateNewChatListWithOpenStatement())
        setHasMoreHistory(false)
        setShowLoadHistoryButton(false)
      }
    }
    catch (error) {
      console.error('Error during conversation switch:', error)
      Toast.notify({
        type: 'error',
        message: t('app.errorMessage.conversationSwitchFailed') || '切换会话失败',
      })
    }
    finally {
      // 结束会话切换
      setIsSwitchingConversation(false)
    }
  }, [config, isNewConversation, conversationList, getCurrConversationId, newConversationInputs, t])

  // 辅助函数：生成开场白消息列表
  function generateNewChatListWithOpenStatement(introduction?: string, inputs?: Record<string, any> | null) {
    return []
  }

  return {
    // 会话列表相关
    conversationList,
    showConversationList,
    setShowConversationList,
    isSwitchingConversation,
    setIsSwitchingConversation,

    // 会话信息
    currConversationId,
    currConversationInfo,
    isNewConversation,

    // 处理函数
    handleConversationSelect,
    handleNewConversation,
    handleConversationSwitch,
    handleDeleteConversation,
    handleRenameConversation,

    // 其他会话操作
    deleteConversationFromList,
    renameConversationInList,

    // Refs
    shouldSkipConversationSwitch,

    // 原始 hook 的返回值
    setConversationList,
    setCurrConversationId,
    getCurrConversationId,
    currInputs,
    resetNewConversationInputs,
    setCurrInputs,
    setNewConversationInfo,
    setExistConversationInfo,
  }
}
