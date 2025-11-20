'use client'
import type { FC } from 'react'
import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { setAutoFreeze } from 'immer'
import { useBoolean } from 'ahooks'
import type { ChatConfig, ChatItem, VisionSettings } from '@/types/app'
import SimpleChat from '@/app/components/chat/simple-chat'
import MobilePullToRefresh from '@/app/components/base/mobile-pull-to-refresh'
import OptimizedInput from '@/app/components/chat/optimized-input'
import { EVENTS, eventBus } from '@/app/utils/event-bus'
import { userInputsFormToPromptVariables } from '@/utils/prompt'
import AppUnavailable from './chat/app-unavailable'
import { APP_INFO, promptTemplate } from '@/config'
import TryToAsk from './chat/try-to-ask'
import Cookies from 'js-cookie'
import { USERID_COOKIE_NAME } from '@/config'
import Loading from '@/app/components/base/loading'
import { ConversationList, ConversationToggle } from '@/app/components/conversation'

// 导入优化后的自定义 Hooks
import { useAppConfig } from '@/hooks/useAppConfig'
import { useChatState } from '@/hooks/useChatState'
import { useInputBoxHeight } from '@/hooks/useInputBoxHeight'
import { useMessageHandlers } from '@/hooks/useMessageHandlers'
import { useConversationManager } from '@/hooks/useConversationManager'

// 导入服务
import { fetchAppParams, fetchConversations, fetchChatList } from '@/services'
import type { PromptConfig } from '@/types/app'
import { Resolution, TransferMethod } from '@/types/app'
import { addFileInfos, sortAgentSorts } from '@/utils/tools'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import useAppStore from '@/hooks/useAppStore'
import Toast from '@/app/components/base/toast'

export type IOptimizedMainProps = {
  params: any
  headerContent?: React.ReactNode
  faqContent?: React.ReactNode
}

const OptimizedMain: FC<IOptimizedMainProps> = ({ headerContent, faqContent }) => {
  const { t } = useTranslation()
  const inputBoxRef = useRef<HTMLDivElement>(null)

  // ========== 配置管理 ==========
  const appConfig = useAppConfig()
  const { apiKey, appId, apiUrl, isLoading: isConfigLoading, hasError: hasConfigError } = appConfig

  // ========== 输入框高度管理 ==========
  const { inputBoxHeight } = useInputBoxHeight(inputBoxRef)

  // ========== 聊天状态管理 ==========
  const { state: chatState, actions: chatActions } = useChatState()

  // ========== 会话管理 ==========
  const conversationManager = useConversationManager({
    appId,
    inited: false, // 将在下面设置
    isResponding: chatState.isResponding,
    setChatList: chatActions.setChatList,
    setHistoryMessages: chatActions.setHistoryMessages,
    setShowLoadHistoryButton: chatActions.setShowLoadHistoryButton,
    setHasMoreHistory: chatActions.setHasMoreHistory,
    setSuggestQuestionsAfterAnswer: chatActions.setSuggestedQuestions,
    setIsSwitchingConversation: () => {}, // 将在下面处理
    setExistConversationInfo: () => {}, // 将在下面处理
    setNewConversationInfo: () => {}, // 将在下面处理
    setCurrInputs: () => {}, // 将在下面处理
    resetNewConversationInputs: conversationManager.resetNewConversationInputs,
    setAppUnavailable: () => {}, // 将在下面处理
    setIsUnknownReason: () => {}, // 将在下面处理
    setInited: () => {}, // 将在下面处理
    setPromptConfig: () => {}, // 将在下面处理
    setVisionConfig: () => {}, // 将在下面处理
    setConversationList: conversationManager.setConversationList,
    setCurrConversationId: conversationManager.setCurrConversationId,
  })

  // ========== 应用状态 ==========
  const [appUnavailable, setAppUnavailable] = useState<boolean>(false)
  const [isUnknownReason, setIsUnknownReason] = useState<boolean>(false)
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)
  const [visionConfig, setVisionConfig] = useState<VisionSettings | undefined>({
    enabled: true,
    number_limits: 2,
    detail: Resolution.low,
    transfer_methods: [TransferMethod.local_file],
  })
  const [chatConfig, setChatConfig] = useState<ChatConfig>()

  // ========== 响应式状态 ==========
  const [isChatStarted, { setFalse: setChatNotStarted }] = useBoolean(false)

  // ========== 消息处理器 ==========
  const messageHandlers = useMessageHandlers({
    appId,
    apiUrl,
    visionConfig,
    chatConfig,
    currInputs: conversationManager.currInputs,
    setCurrInputs: conversationManager.setCurrInputs,
    newConversationInputs: conversationManager.newConversationInputs,
    resetNewConversationInputs: conversationManager.resetNewConversationInputs,
    getCurrConversationId: conversationManager.getCurrConversationId,
    setCurrConversationId: conversationManager.setCurrConversationId,
    setConversationIdChangeBecauseOfNew: () => {}, // 将在下面处理
    setChatNotStarted,
    setExistConversationInfo: conversationManager.setExistConversationInfo,
    setConversationList: conversationManager.setConversationList,
    chatState,
    chatActions,
    promptConfig,
  })

  // ========== 初始化配置 ==========
  useEffect(() => {
    setAutoFreeze(false)
    return () => {
      setAutoFreeze(true)
    }
  }, [])

  // ========== 应用初始化 ==========
  useEffect(() => {
    if (!appId || !appConfig.hasSetAppConfig) {
      setAppUnavailable(true)
      return
    }

    const { useUserID } = useNativeBridge()
    const userInfo = useUserID()
    if (!userInfo['user-id']) return

    let isMounted = true

    const initializeApp = async () => {
      try {
        const [conversationData, appParams] = await Promise.all([
          fetchConversations(),
          fetchAppParams()
        ])

        console.log('conversationData', conversationData)
        console.log('appParams', appParams)
        setChatConfig(appParams)

        const { data: conversations, error } = conversationData as { data: any[]; error: string }
        if (error) {
          Toast.notify({ type: 'error', message: error })
          throw new Error(error)
        }

        const currentConversation = conversations[0]
        const isNewConversation = !currentConversation

        console.log('isNewConversation', isNewConversation)

        const { user_input_form, opening_statement: introduction, file_upload, system_parameters, suggested_questions = [] }: any = appParams

        // 设置会话信息
        conversationManager.setNewConversationInfo({
          name: t('app.chat.newChatDefaultName'),
          introduction,
          suggested_questions,
        })

        if (!isNewConversation) {
          conversationManager.setExistConversationInfo({
            name: currentConversation.name || t('app.chat.newChatDefaultName'),
            introduction,
            suggested_questions,
          })
        }

        // 设置提示配置
        const prompt_variables = userInputsFormToPromptVariables(user_input_form)
        setPromptConfig({
          prompt_template: promptTemplate,
          prompt_variables,
        } as PromptConfig)

        // 设置视觉配置
        setVisionConfig({
          enabled: file_upload?.enabled || false,
          number_limits: file_upload?.number_limits || 2,
          detail: Resolution.low,
          transfer_methods: file_upload?.allowed_file_upload_methods || [TransferMethod.local_file],
          image_file_size_limit: system_parameters?.image_file_size_limit || 0,
        })

        conversationManager.setConversationList(conversations)

        // 设置当前会话ID
        if (isNewConversation) {
          conversationManager.setCurrConversationId('-1', appId, false)
        } else {
          conversationManager.setCurrConversationId(currentConversation.id, appId, false)
        }

      } catch (e: any) {
        if (e.status === 404) {
          setAppUnavailable(true)
        } else {
          setIsUnknownReason(true)
          setAppUnavailable(true)
        }
      }
    }

    initializeApp()

    return () => {
      isMounted = false
    }
  }, [appId, appConfig.hasSetAppConfig])

  // ========== 监听FAQ问题点击事件 ==========
  useEffect(() => {
    if (!appConfig.hasSetAppConfig) return

    const handleSendMessage = (message: string) => {
      if (conversationManager.isNewConversation && conversationManager.conversationList.length > 0) {
        const firstConversation = conversationManager.conversationList[0]
        if (firstConversation && firstConversation.id !== '-1') {
          conversationManager.setCurrConversationId(firstConversation.id, appId, false)
          setTimeout(() => {
            messageHandlers.handleSend(message)
          }, 100)
          return
        }
      } else {
        conversationManager.setCurrConversationId('-1', appId, false)
      }
      messageHandlers.handleSend(message)
    }

    eventBus.on(EVENTS.SEND_MESSAGE, handleSendMessage)
    return () => {
      eventBus.off(EVENTS.SEND_MESSAGE, handleSendMessage)
    }
  }, [appId, conversationManager.isNewConversation, conversationManager.conversationList, appConfig.hasSetAppConfig, messageHandlers])

  // ========== 用户Cookie设置 ==========
  useEffect(() => {
    const { useUserID } = useNativeBridge()
    const userInfo = useUserID()
    console.log('Main userInfo ==> ', userInfo)
    if (typeof window !== 'undefined') {
      Cookies.set(USERID_COOKIE_NAME, userInfo['user-id'])
    }
  }, [])

  // ========== 检查是否可以发送消息 ==========
  const checkCanSend = useCallback(() => {
    if (conversationManager.getCurrConversationId() !== '-1') return true
    if (!conversationManager.currInputs || !promptConfig?.prompt_variables) return true

    const inputLens = Object.values(conversationManager.currInputs).length
    const promptVariablesLens = promptConfig.prompt_variables.length
    const emptyInput = inputLens < promptVariablesLens || Object.values(conversationManager.currInputs).find(v => !v)

    if (emptyInput) {
      Toast.notify({ type: 'error', message: t('app.errorMessage.valueOfVarRequired') })
      return false
    }
    return true
  }, [conversationManager.getCurrConversationId, conversationManager.currInputs, promptConfig, t])

  // ========== 加载历史消息 ==========
  const loadHistoryMessages = useCallback(async () => {
    console.log('🔄 loadHistoryMessages called')
    if (chatState.isLoadingHistory || !chatState.hasMoreHistory || conversationManager.isNewConversation) {
      console.log('❌ loadHistoryMessages blocked')
      return
    }

    chatActions.setLoadingHistory(true)
    try {
      const currentChatList = chatState.chatList
      if (currentChatList.length === 0) {
        chatActions.setLoadingHistory(false)
        return
      }

      // 找到第一个回答消息的ID
      let firstMessageId = null
      const currentHistoryMessages = chatState.historyMessages

      if (currentHistoryMessages.length > 0) {
        for (const item of currentHistoryMessages) {
          if (item.isAnswer && item.id && !item.id.startsWith('question-') && !item.id.includes('placeholder')) {
            firstMessageId = item.id
            break
          }
        }
      } else {
        for (const item of currentChatList) {
          if (item.isAnswer && item.id && !item.id.startsWith('question-') && !item.id.includes('placeholder')) {
            firstMessageId = item.id
            break
          }
        }
      }

      if (!firstMessageId) {
        chatActions.setLoadingHistory(false)
        return
      }

      console.log(`firstMessageId ${firstMessageId}`)
      const res = await fetchChatList(conversationManager.getCurrConversationId(), firstMessageId, 5)
      const { data, has_more } = res

      if (data && data.length > 0) {
        const historyItems: ChatItem[] = []

        data.forEach((item: any) => {
          historyItems.push({
            id: `question-${item.id}`,
            key: `history-question-${item.id}`,
            content: item.query,
            isAnswer: false,
            message_files: item.message_files?.filter((file: any) => file.belongs_to === 'user') || [],
          })
          historyItems.push({
            id: item.id,
            key: `history-answer-${item.id}`,
            content: item.answer,
            agent_thoughts: addFileInfos(
              item.agent_thoughts ? sortAgentSorts(item.agent_thoughts) : item.agent_thoughts,
              item.message_files
            ),
            feedback: item.feedback,
            isAnswer: true,
            message_files: item.message_files?.filter((file: any) => file.belongs_to === 'assistant') || [],
          })
        })

        chatActions.addHistoryMessages(historyItems)
        chatActions.setHasMoreHistory(has_more)
        if (!has_more) chatActions.setShowLoadHistoryButton(false)
      } else {
        chatActions.setHasMoreHistory(false)
        chatActions.setShowLoadHistoryButton(false)
      }
    } catch (error) {
      console.error('加载历史消息失败:', error)
      Toast.notify({ type: 'error', message: t('app.errorMessage.historyLoadFailed') || '加载历史消息失败' })
    } finally {
      chatActions.setLoadingHistory(false)
      console.log('🏁 loadHistoryMessages finished')
    }
  }, [
    chatState.isLoadingHistory,
    chatState.hasMoreHistory,
    conversationManager.isNewConversation,
    chatState.chatList,
    chatState.historyMessages,
    chatActions,
    conversationManager.getCurrConversationId,
    t
  ])

  // ========== 错误处理 ==========
  const logError = useCallback((message: string) => {
    Toast.notify({ type: 'error', message })
  }, [])

  // ========== 记忆化计算 ==========
  const memoizedConversationList = useMemo(() => conversationManager.conversationList, [conversationManager.conversationList])
  const memoizedChatList = useMemo(() => chatState.chatList, [chatState.chatList])

  // ========== 渲染 ==========
  if (appUnavailable) {
    return <AppUnavailable isUnknownReason={isUnknownReason} errMessage={!appConfig.hasSetAppConfig ? 'Please set appId and apiKey in config/index.tsx' : ''} />
  }

  if (!appId || !APP_INFO || !promptConfig || isConfigLoading) {
    return <Loading className='mt-16' type='app' />
  }

  return (
    <div className='flex min-h-screen max-w-full flex-col bg-white' style={{ paddingBottom: `${inputBoxHeight}px` }}>
      {/* 会话列表 */}
      <ConversationList
        conversationList={memoizedConversationList}
        currentConversationId={conversationManager.currConversationId}
        onConversationSelect={conversationManager.handleConversationSelect}
        onNewConversation={conversationManager.handleNewConversation}
        onConversationDeleted={conversationManager.handleDeleteConversation}
        onConversationRenamed={conversationManager.handleRenameConversation}
        isVisible={conversationManager.showConversationList}
        onClose={() => conversationManager.setShowConversationList(false)}
      />

      <MobilePullToRefresh
        onLoadMore={loadHistoryMessages}
        loadingMore={chatState.isLoadingHistory}
        hasMoreData={chatState.hasMoreHistory}
        noMoreDataText={t('app.chat.noMoreMessages')}
      >
        {/* 页面内容区域 */}
        <div className='flex flex-col bg-white'>
          {/* 头部内容 */}
          <div className='shrink-0 sticky top-0 z-40 bg-white border-b border-gray-100'>
            <div className='flex items-center justify-between p-4'>
              <div className='flex items-center gap-3'>
                <ConversationToggle
                  onClick={() => conversationManager.setShowConversationList(true)}
                  conversationCount={memoizedConversationList.length}
                />
                <div>
                  <h1 className='text-lg font-semibold text-gray-900'>
                    {conversationManager.currConversationInfo?.name || t('app.chat.newChatDefaultName')}
                  </h1>
                  {conversationManager.currConversationInfo?.introduction && (
                    <p className='text-sm text-gray-500 mt-1 line-clamp-1'>
                      {conversationManager.currConversationInfo.introduction}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {headerContent}
          </div>

          {/* FAQ内容 */}
          {faqContent && (
            <div className='shrink-0'>
              {faqContent}
            </div>
          )}

          {/* 聊天消息区域 */}
          <div className='flex-1 p-4'>
            <div className='h-full'>
              {conversationManager.isSwitchingConversation ? (
                <div className='flex items-center justify-center h-full'>
                  <div className='flex flex-col items-center gap-4'>
                    <Loading type='area' />
                    <p className='text-sm text-gray-500'>
                      {t('app.conversation.switching') || '切换会话中...'}
                    </p>
                  </div>
                </div>
              ) : (
                <SimpleChat
                  chatList={memoizedChatList}
                  onSend={messageHandlers.handleSend}
                  onFeedback={messageHandlers.handleFeedback}
                  isResponding={chatState.isResponding}
                  checkCanSend={checkCanSend}
                  visionConfig={visionConfig}
                  isHideSendInput={true}
                  showLoadHistoryButton={chatState.showLoadHistoryButton}
                  isLoadingHistory={chatState.isLoadingHistory}
                  onLoadHistory={loadHistoryMessages}
                  historyMessages={chatState.historyMessages}
                />
              )}
            </div>
          </div>
        </div>
      </MobilePullToRefresh>

      {/* 固定在窗口底部的输入框 */}
      <div ref={inputBoxRef} className='fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200'>
        {chatConfig?.suggested_questions_after_answer?.enabled && !!chatState.suggestedQuestionsAfterAnswer?.length && (
          <TryToAsk
            suggestedQuestions={chatState.suggestedQuestionsAfterAnswer}
            onSend={messageHandlers.handleSend}
            isMobile={true}
            isLoading={chatState.isSuggestQuestionsLoading}
          />
        )}

        {/* 极端错误时显示刷新提示 */}
        {chatState.hasExtremeError && (
          <div className='mb-3 rounded-lg bg-red-50 p-3 text-center'>
            <div className='mb-2 text-sm text-red-600'>
              检测到会话异常，建议刷新页面重新开始
            </div>
            <button
              onClick={() => {
                chatActions.resetChatState()
                chatActions.setExtremeError(false)
                window.location.reload()
              }}
              className='rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600'
            >
              刷新页面
            </button>
          </div>
        )}

        <OptimizedInput
          onSend={messageHandlers.handleSend}
          onStop={messageHandlers.handleStop}
          checkCanSend={checkCanSend}
          visionConfig={visionConfig}
          chatConfig={chatConfig}
          isResponding={chatState.isResponding}
        />
      </div>
    </div>
  )
}

export default React.memo(OptimizedMain)