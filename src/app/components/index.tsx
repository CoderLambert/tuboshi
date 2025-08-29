'use client'
import type { FC } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { produce, setAutoFreeze } from 'immer'
import { useBoolean, useGetState } from 'ahooks'
import useConversation from '@/hooks/use-conversation'
import Toast from '@/app/components/base/toast'
import { fetchAppParams, fetchChatList, fetchConversations, fetchSuggestedQuestions, generationConversationName, sendChatMessage, stopChatMessage, updateFeedback } from '@/services'
import type { ChatConfig, ChatItem, ConversationItem, Feedbacktype, PromptConfig, VisionFile, VisionSettings } from '@/types/app'
import { Resolution, TransferMethod, WorkflowRunningStatus } from '@/types/app'
import SimpleChat from '@/app/components/chat/simple-chat'
import MobilePullToRefresh from '@/app/components/base/mobile-pull-to-refresh'
import OptimizedInput from '@/app/components/chat/optimized-input'
import { EVENTS, eventBus } from '@/app/utils/event-bus'
import { userInputsFormToPromptVariables } from '@/utils/prompt'
import AppUnavailable from './chat/app-unavailable'
import { APP_INFO, USERID_COOKIE_NAME, getApiUrl, getAppId, getAppKey, promptTemplate } from '@/config'
import type { Annotation as AnnotationType } from '@/types/log'
import { addFileInfos, sortAgentSorts } from '@/utils/tools'
import TryToAsk from './chat/try-to-ask'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import Cookies from 'js-cookie'
import useAppStore from '@/hooks/useAppStore'
import Loading from '@/app/components/base/loading'

export type IMainProps = {
  params: any
  headerContent?: React.ReactNode
  faqContent?: React.ReactNode
}

const Main: FC<IMainProps> = ({ headerContent, faqContent }) => {
  const { t } = useTranslation()
  const hasSetAppConfig = useRef(false)

  // 输入框状态管理 - 使用useRef避免频繁重渲染
  const currentQueryRef = useRef('')

  const [chatConfig, setChatConfig] = useState<ChatConfig>()
  // 动态高度计算相关状态
  const [inputBoxHeight, setInputBoxHeight] = useState<number>(120) // 默认高度
  const inputBoxRef = useRef<HTMLDivElement>(null)

  const userID = useAppStore((state: any) => state.userID)

  console.log('useAppStore userID', userID)
  // const apiKey = getAppKey()
  // console.log('apiKey', apiKey)
  // const appId = getAppId()
  // console.log('appId', appId)
  // const apiUrl = getApiUrl()
  // console.log('apiKey', apiUrl)

  const [apiKey, setApiKey] = useState<string | undefined>(undefined)
  const [appId, setAppId] = useState<string | undefined>(undefined)
  const [apiUrl, setApiUrl] = useState<string | undefined>(undefined)

  /*
  * app info
  */
  const [appUnavailable, setAppUnavailable] = useState<boolean>(false)
  const [isUnknownReason, setIsUnknownReason] = useState<boolean>(false)
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)
  const [inited, setInited] = useState<boolean>(false)
  // const [, { setFalse: hideSidebar }] = useBoolean(false)
  const [visionConfig, setVisionConfig] = useState<VisionSettings | undefined>({
    enabled: true,
    number_limits: 2,
    detail: Resolution.low,
    transfer_methods: [TransferMethod.local_file],
  })

  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const { notify } = Toast
  const [controlFocus, setControlFocus] = useState(0)
  const [openingSuggestedQuestions, setOpeningSuggestedQuestions] = useState<string[]>([])
  const hasStopResponded = useRef(false)
  const taskIdRef = useRef('')
  const isRespondingRef = useRef(false)

  // const [hasStopResponded, setHasStopResponded, getHasStopResponded] = useGetState(false)
  const [isRespondingConIsCurrCon, setIsRespondingConCurrCon, getIsRespondingConIsCurrCon] = useGetState(true)
  const [userQuery, setUserQuery] = useState('')
  const conversationMessagesAbortControllerRef = useRef<AbortController | null>(null)
  const suggestedQuestionsAbortControllerRef = useRef<AbortController | null>(null)
  const [suggestQuestionsAfterAnswer, setSuggestQuestionsAfterAnswer] = useState<string[]>([])
  const updateInputBoxHeight = () => {
    if (inputBoxRef.current) {
      const height = inputBoxRef.current.offsetHeight
      setInputBoxHeight(height)
    }
  }

    /*
  * chat info. chat is under conversation.
  */
  const [chatList, setChatList, getChatList] = useGetState<ChatItem[]>([])

  // 历史消息状态管理 - 与chatList完全分离
  const [historyMessages, setHistoryMessages] = useState<ChatItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [hasMoreHistory, setHasMoreHistory] = useState(true)
  const [showLoadHistoryButton, setShowLoadHistoryButton] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const [isSuggestQuestionsLoading, setIsSuggestQuestionsLoading] = useState(false)

  // onData change thought (the produce obj). https://github.com/immerjs/immer/issues/576
  useEffect(() => {
    setAutoFreeze(false)
    return () => {
      setAutoFreeze(true)
    }
  }, [])

// 在现有的 useEffect 之后添加新的 useEffect
useEffect(() => {
  const loadConfig = async () => {
    try {
      const key = await getAppKey()
      const id = await getAppId()
      const url = await getApiUrl()

      setApiKey(key)
      setAppId(id)
      setApiUrl(url)
      console.log('=========== loadConfig start========')
      console.log('apiKey', key)
      console.log('appId', id)
      console.log('apiUrl', url)
      console.log('=========== loadConfig end ========')
    }
 catch (error) {
      console.error('Failed to load app config:', error)
      // 使用默认值
    }
  }

  loadConfig()
}, [])

useEffect(() => {
  if (apiKey && appId && apiUrl) {
    console.log('=========== loadConfig  finish ========')

    console.log('apiKey', apiKey)
    console.log('appId', appId)
    console.log('apiUrl', apiUrl)
    // 在这里执行依赖这些配置的逻辑
    hasSetAppConfig.current = true
  }
}, [apiKey, appId, apiUrl])

  // 动态计算输入框高度
  useEffect(() => {
    // 延迟初始计算，确保DOM已渲染
    const timer = setTimeout(() => {
      updateInputBoxHeight()
    }, 100)

    // 监听窗口大小变化
    const handleResize = () => {
      updateInputBoxHeight()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 设置观察器来监听输入框高度变化
  useEffect(() => {
    const setupObservers = () => {
      if (!inputBoxRef.current) {
        // 如果ref还没有设置，延迟重试
        setTimeout(setupObservers, 100)
        return
      }

      // 立即更新一次
      updateInputBoxHeight()

      // 监听输入框内容变化（使用ResizeObserver）
      let resizeObserver: ResizeObserver | null = null
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            // 使用 borderBoxSize 获取包含边框和padding的完整高度
            const height = entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height + 32
            console.log('ResizeObserver检测到高度变化:', height) // 调试日志
            setInputBoxHeight(height)
          }
        })
        resizeObserver.observe(inputBoxRef.current)
      }

      // 监听DOM变化（使用MutationObserver）
      let mutationObserver: MutationObserver | null = null
      if (window.MutationObserver) {
        mutationObserver = new MutationObserver(() => {
          // 延迟一点执行，确保DOM更新完成
          setTimeout(updateInputBoxHeight, 50)
        })
        mutationObserver.observe(inputBoxRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class'],
        })
      }

      // 返回清理函数
      return () => {
        if (resizeObserver)
          resizeObserver.disconnect()

        if (mutationObserver)
          mutationObserver.disconnect()
      }
    }

    const cleanup = setupObservers()
    return cleanup
  }, []) // 空依赖数组，但内部会重试直到ref可用

  /*
  * conversation info
  */
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
  } = useConversation()
  //  获取用户需要输入的表单
  const { useInputsFormConfig } = useNativeBridge()
  const inputsFormConfig = useInputsFormConfig()

  const [conversationIdChangeBecauseOfNew, setConversationIdChangeBecauseOfNew, getConversationIdChangeBecauseOfNew] = useGetState(false)
  const [isChatStarted, { setFalse: setChatNotStarted }] = useBoolean(false)
  const conversationIntroduction = currConversationInfo?.introduction || ''
  const suggestedQuestions = currConversationInfo?.suggested_questions || []

  const handleConversationSwitch = () => {
    console.log('handleConversationSwitch')
    if (!inited)
      return

    // update inputs of current conversation

    let notSyncToStateIntroduction = ''
    let notSyncToStateInputs: Record<string, any> | undefined | null = {
      // token: APP_TOKEN,
      ...inputsFormConfig,
    }
    if (!isNewConversation) {
      const item = conversationList.find(item => item.id === getCurrConversationId())
      notSyncToStateInputs = item?.inputs || {}
      setCurrInputs(notSyncToStateInputs as any)
      notSyncToStateIntroduction = item?.introduction || ''
      setExistConversationInfo({
        name: item?.name || '',
        introduction: notSyncToStateIntroduction,
        suggested_questions: suggestedQuestions,
      })
    }
    else {
      notSyncToStateInputs = newConversationInputs
      setCurrInputs(notSyncToStateInputs)
    }

    // update chat list of current conversation
    if (!isNewConversation && !conversationIdChangeBecauseOfNew && !isResponding) {
      // 初始加载最近5条消息
      fetchChatList(getCurrConversationId(), undefined, 5, userID['user-id']).then((res: any) => {
        const { data, has_more } = res
        const newChatList: ChatItem[] = generateNewChatListWithOpenStatement(notSyncToStateIntroduction, notSyncToStateInputs)

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
            agent_thoughts: addFileInfos(item.agent_thoughts ? sortAgentSorts(item.agent_thoughts) : item.agent_thoughts, item.message_files),
            feedback: item.feedback,
            isAnswer: true,
            message_files: item.message_files?.filter((file: any) => file.belongs_to === 'assistant') || [],
          })
        })
        setChatList(newChatList)

        // 设置历史消息状态
        setHasMoreHistory(has_more)
        setShowLoadHistoryButton(has_more)
      }).catch((error) => {
        console.error('初始加载消息失败:', error)
        // 如果加载失败，至少显示开场白
        setChatList(generateNewChatListWithOpenStatement(notSyncToStateIntroduction, notSyncToStateInputs))
        setHasMoreHistory(false)
        setShowLoadHistoryButton(false)
      })
    }

    if (isNewConversation && isChatStarted)
      setChatList(generateNewChatListWithOpenStatement())
  }
  useEffect(handleConversationSwitch, [currConversationId, inited])

  useEffect(() => {
    setCurrConversationId(chatList[0]?.id || '-1', appId!, false)
  }, [])

  // 使用ref来避免闭包问题
  const isLoadingHistoryRef = useRef(false)
  const historyMessagesRef = useRef<ChatItem[]>([])

  // 同步historyMessages到ref
  useEffect(() => {
    historyMessagesRef.current = historyMessages
  }, [historyMessages])

  // 加载历史消息
  const loadHistoryMessages = useCallback(async () => {
    console.log('🔄 loadHistoryMessages called - isLoadingHistoryRef:', isLoadingHistoryRef.current, 'hasMoreHistory:', hasMoreHistory)

    if (isLoadingHistoryRef.current || !hasMoreHistory || isNewConversation) {
      console.log('❌ loadHistoryMessages blocked')
      return
    }

    isLoadingHistoryRef.current = true
    setIsLoadingHistory(true)
    try {
      const currentChatList = getChatList()
      if (currentChatList.length === 0) {
        setIsLoadingHistory(false)
        return
      }

      // 确定first_id：优先使用历史消息的最早ID，否则使用当前chatList的最早ID
      let firstMessageId = null

      const currentHistoryMessages = historyMessagesRef.current
      if (currentHistoryMessages.length > 0) {
        // 如果已有历史消息，使用历史消息中第一个回答消息的ID
        // 由于新消息插入到开头，第一个回答消息就是最新加载的消息
        for (const item of currentHistoryMessages) {
          if (item.isAnswer && item.id && !item.id.startsWith('question-') && !item.id.includes('placeholder')) {
            firstMessageId = item.id
            console.log('如果已有历史消息 firstMessageId  = item.id', firstMessageId)
            break
          }
        }
      }
      else {
              // 如果没有历史消息，使用当前chatList的第一个回答消息ID
              for (const item of currentChatList) {
                if (item.isAnswer && item.id && !item.id.startsWith('question-') && !item.id.includes('placeholder')) {
                  firstMessageId = item.id
                  console.log('如果没有历史消息，使用当前chatList的第一个回答消息ID firstMessageId  = item.id', firstMessageId)
                  break
                }
              }
            }

      if (!firstMessageId) {
        setIsLoadingHistory(false)
        return
      }

      if (currentHistoryMessages.length > 0) {
        const answerIds = currentHistoryMessages.filter(item => item.isAnswer).map(item => item.id)
      }
      console.log(`firstMessageId   ${firstMessageId}`)
      const res = await fetchChatList(getCurrConversationId(), firstMessageId, 5, userID['user-id'])
      const { data, has_more } = res
      if (data && data.length > 0) {
        const historyItems: ChatItem[] = []

        data.forEach((item: any) => {
          historyItems.push({
            id: `question-${item.id}`, // 问题ID格式
            key: `history-question-${item.id}`, // 新增key属性用于React渲染
            content: item.query,
            isAnswer: false,
            message_files: item.message_files?.filter((file: any) => file.belongs_to === 'user') || [],
          })
          historyItems.push({
            id: item.id, // 保留原始ID
            key: `history-answer-${item.id}`, // 新增key属性用于React渲染
            content: item.answer,
            agent_thoughts: addFileInfos(item.agent_thoughts ? sortAgentSorts(item.agent_thoughts) : item.agent_thoughts, item.message_files),
            feedback: item.feedback,
            isAnswer: true,
            message_files: item.message_files?.filter((file: any) => file.belongs_to === 'assistant') || [],
          })
        })

        // 将新的历史消息插入到现有历史消息的开头
        setHistoryMessages((prev) => {
          const newHistory = [...historyItems, ...prev]
          return newHistory
        })

        // 更新状态
        setHasMoreHistory(has_more)
        if (!has_more)
          setShowLoadHistoryButton(false)
      }
 else {
        setHasMoreHistory(false)
        setShowLoadHistoryButton(false)
      }
    }
 catch (error) {
      console.error('加载历史消息失败:', error)
      // 使用Toast.notify而不是依赖中的notify
      Toast.notify({ type: 'error', message: t('app.errorMessage.historyLoadFailed') || '加载历史消息失败' })
    }
 finally {
      isLoadingHistoryRef.current = false
      setIsLoadingHistory(false)
      console.log('🏁 loadHistoryMessages finished - reset loading state')
    }
  }, [hasMoreHistory, isNewConversation, getChatList, currConversationId, setHistoryMessages, t])

  // sometime introduction is not applied to state
  const generateNewChatListWithOpenStatement = (introduction?: string, inputs?: Record<string, any> | null) => {
      return []
  }

  // init
  useEffect(() => {
    if (!hasSetAppConfig) {
      setAppUnavailable(true)
      return
    }

    if(!userID['user-id'])
      return

    let isMounted = true // 防止组件卸载后的状态更新

    const initializeApp = async () => {
      try {
        const [conversationData, appParams] = await Promise.all([fetchConversations(userID['user-id']), fetchAppParams(userID['user-id'])])
        console.log('conversationData', conversationData)
        console.log('appParams', appParams)
        setChatConfig(appParams)

        // handle current conversation id
        const { data: conversations, error } = conversationData as { data: ConversationItem[]; error: string }

        if (error) {
          Toast.notify({ type: 'error', message: error })
          throw new Error(error)
        }
        // 如果u个会话列表为空，则代表新的会话。否则继续之前最近的会话
        const currentConversation = conversations[0]
        const isNewConversation = !currentConversation

        // fetch new conversation info
        const { user_input_form, opening_statement: introduction, file_upload, system_parameters, suggested_questions = [] }: any = appParams
        // setLocaleOnClient(APP_INFO.default_language, true)
        setNewConversationInfo({
          name: t('app.chat.newChatDefaultName'),
          introduction,
          suggested_questions,
        })
        if (!isNewConversation) {
          setExistConversationInfo({
            name: currentConversation.name || t('app.chat.newChatDefaultName'),
            introduction,
            suggested_questions,
          })
        }

        const prompt_variables = userInputsFormToPromptVariables(user_input_form)
        setPromptConfig({
          prompt_template: promptTemplate,
          prompt_variables,
        } as PromptConfig)
        setVisionConfig({
            enabled: file_upload?.enabled || false,
            number_limits: file_upload?.number_limits || 2,
            detail: Resolution.low,
            transfer_methods: file_upload?.allowed_file_upload_methods || [TransferMethod.local_file],
            image_file_size_limit: system_parameters?.image_file_size_limit || 0,
        })
        setConversationList(conversations as ConversationItem[])

        if (isNewConversation) {
          setCurrConversationId('-1', appId!, false)
        }
        else {
          // 如果没有当前会话但有历史会话，使用第一个历史会话避免默认新会话状态
          setCurrConversationId(currentConversation.id, appId!, false)
        }

        setInited(true)
      }
      catch (e: any) {
        if (e.status === 404) {
          setAppUnavailable(true)
        }
        else {
          setIsUnknownReason(true)
          setAppUnavailable(true)
        }
      }
    }

      initializeApp()

      return () => {
          isMounted = false
        }
  }, [userID, hasSetAppConfig])

  // 监听FAQ问题点击事件
  useEffect(() => {
    if(!hasSetAppConfig)
      return

    const handleSendMessage = (message: string) => {
      // 如果当前是新会话状态，先确保有一个有效的会话
      if (isNewConversation && conversationList.length > 0) {
        // 使用第一个现有会话，避免创建新会话
        const firstConversation = conversationList[0]
        if (firstConversation && firstConversation.id !== '-1') {
          setCurrConversationId(firstConversation.id, appId!, false)
          // 等待会话切换完成后再发送消息
          setTimeout(() => {
            handleSend(message)
          }, 100)
          return
        }
      }
 else {
      setCurrConversationId('-1', appId!, false)
      }
      handleSend(message)
    }

    eventBus.on(EVENTS.SEND_MESSAGE, handleSendMessage)

    return () => {
      eventBus.off(EVENTS.SEND_MESSAGE, handleSendMessage)
    }
  }, [isNewConversation, conversationList, hasSetAppConfig])

  const { useUserID } = useNativeBridge()
  const userInfo = useUserID()
  console.log('Main userInfo ==> ', userInfo)
  Cookies.set(USERID_COOKIE_NAME, userInfo['user-id'])

  const logError = (message: string) => {
    notify({ type: 'error', message })
  }

  const checkCanSend = () => {
    if (getCurrConversationId() !== '-1')
      return true

    if (!currInputs || !promptConfig?.prompt_variables)
      return true

    const inputLens = Object.values(currInputs).length
    const promptVariablesLens = promptConfig.prompt_variables.length

    const emptyInput = inputLens < promptVariablesLens || Object.values(currInputs).find(v => !v)
    if (emptyInput) {
      logError(t('app.errorMessage.valueOfVarRequired'))
      return false
    }
    return true
  }

  const updateCurrentQA = ({
    responseItem,
    questionId,
    placeholderAnswerId,
    questionItem,
  }: {
    responseItem: ChatItem
    questionId: string
    placeholderAnswerId: string
    questionItem: ChatItem
  }) => {
    // closesure new list is outdated.
    const newListWithAnswer = produce(
      getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
      (draft) => {
        if (!draft.find(item => item.id === questionId))
          draft.push({ ...questionItem })

        draft.push({ ...responseItem })
      })
    setChatList(newListWithAnswer)
  }

  const transformToServerFile = (fileItem: any) => {
    return {
      type: 'image',
      transfer_method: fileItem.transferMethod,
      url: fileItem.url,
      upload_file_id: fileItem.id,
    }
  }

  const handleSend = useCallback(async (message: string, files?: VisionFile[]) => {
    if (isResponding) {
      notify({ type: 'info', message: t('app.errorMessage.waitForResponse') })
      return
    }
    // 发送成功后清空输入框状态、建议问题
    currentQueryRef.current = ''
    setIsSuggestQuestionsLoading(false)
    setSuggestQuestionsAfterAnswer([])
    console.log(`inputsFormConfig ---> ${JSON.stringify(inputsFormConfig)}`)
    const toServerInputs: Record<string, any> = {
      ...inputsFormConfig,
    }
    if (currInputs) {
      Object.keys(currInputs).forEach((key) => {
        const value = currInputs[key]
        if (value.supportFileType)
          toServerInputs[key] = transformToServerFile(value)

        else if (value[0]?.supportFileType)
          toServerInputs[key] = value.map((item: any) => transformToServerFile(item))

        else
          toServerInputs[key] = value
      })
    }
    console.log(`toServerInputs ---> ${JSON.stringify(toServerInputs)}`)
    const data: Record<string, any> = {
      inputs: toServerInputs,
      query: message,
      conversation_id: isNewConversation ? null : currConversationId,
    }

    if (visionConfig?.enabled && files && files?.length > 0) {
      data.files = files.map((item) => {
        if (item.transfer_method === TransferMethod.local_file) {
          return {
            ...item,
            url: '',
          }
        }
        return item
      })
    }

    // question
    const questionId = `question-${Date.now()}`
    const questionItem = {
      id: questionId,
      content: message,
      isAnswer: false,
      message_files: files,
    }

    const placeholderAnswerId = `answer-placeholder-${Date.now()}`
    const placeholderAnswerItem = {
      id: placeholderAnswerId,
      content: '',
      isAnswer: true,
    }

    const newList = [...getChatList(), questionItem, placeholderAnswerItem]
    setChatList(newList)

    let isAgentMode = false

    // answer
    const responseItem: ChatItem = {
      id: `${Date.now()}`,
      content: '',
      agent_thoughts: [],
      message_files: [],
      isAnswer: true,
    }
    let hasSetResponseId = false

    const prevTempNewConversationId = getCurrConversationId() || '-1'
    let tempNewConversationId = ''

    handleResponding(true)

    sendChatMessage(data, {
      getAbortController: (abortController) => {
        setAbortController(abortController)
      },
      onData: (message: string, isFirstMessage: boolean, { conversationId: newConversationId, messageId, taskId }: any) => {
        if (!isAgentMode) {
          responseItem.content = responseItem.content + message
        }
        else {
          const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
          if (lastThought)
            lastThought.thought = lastThought.thought + message // need immer setAutoFreeze
        }
        if (messageId && !hasSetResponseId) {
          responseItem.id = messageId
          hasSetResponseId = true
        }

        if (isFirstMessage && newConversationId)
          tempNewConversationId = newConversationId

        taskIdRef.current = taskId
        // setMessageTaskId(taskId)
        // has switched to other conversation
        if (prevTempNewConversationId !== getCurrConversationId()) {
          setIsRespondingConCurrCon(false)
          return
        }
        updateCurrentQA({
          responseItem,
          questionId,
          placeholderAnswerId,
          questionItem,
        })
      },
      async onCompleted(hasError?: boolean) {
        if (hasError)
          return

        if (getConversationIdChangeBecauseOfNew()) {
          const { data: allConversations }: any = await fetchConversations(userID['user-id'])
          const newItem: any = await generationConversationName(allConversations[0].id)

          const newAllConversations = produce(allConversations, (draft: any) => {
            draft[0].name = newItem.name
          })
          setConversationList(newAllConversations as any)
        }
        setConversationIdChangeBecauseOfNew(false)
        resetNewConversationInputs()
        setChatNotStarted()
        setCurrConversationId(tempNewConversationId, appId!, true)
        handleResponding(false)

        // 开启建议问题后，且没有停止对话时，请求建议问题
       if (chatConfig?.suggested_questions_after_answer?.enabled && !hasStopResponded.current) {
            try {
              // 添加获取建议问题 api 调用
              setIsSuggestQuestionsLoading(true)
              const { data } = await fetchSuggestedQuestions(
                responseItem.id,
                userID['user-id'],
              )
              setSuggestQuestionsAfterAnswer(data)
            }
            // eslint-disable-next-line unused-imports/no-unused-vars
            catch (e) {
              setSuggestQuestionsAfterAnswer([])
            }
            finally {
              setIsSuggestQuestionsLoading(false)
            }
          }
      },
      onFile(file) {
        const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
        if (lastThought)
          lastThought.message_files = [...(lastThought as any).message_files, { ...file }]

        updateCurrentQA({
          responseItem,
          questionId,
          placeholderAnswerId,
          questionItem,
        })
      },
      onThought(thought) {
        isAgentMode = true
        const response = responseItem as any
        if (thought.message_id && !hasSetResponseId) {
          response.id = thought.message_id
          hasSetResponseId = true
        }
        // responseItem.id = thought.message_id;
        if (response.agent_thoughts.length === 0) {
          response.agent_thoughts.push(thought)
        }
        else {
          const lastThought = response.agent_thoughts[response.agent_thoughts.length - 1]
          // thought changed but still the same thought, so update.
          if (lastThought.id === thought.id) {
            thought.thought = lastThought.thought
            thought.message_files = lastThought.message_files
            responseItem.agent_thoughts![response.agent_thoughts.length - 1] = thought
          }
          else {
            responseItem.agent_thoughts!.push(thought)
          }
        }
        // has switched to other conversation
        if (prevTempNewConversationId !== getCurrConversationId()) {
          setIsRespondingConCurrCon(false)
          return false
        }

        updateCurrentQA({
          responseItem,
          questionId,
          placeholderAnswerId,
          questionItem,
        })
      },
      onMessageEnd: (messageEnd) => {
        if (messageEnd.metadata?.annotation_reply) {
          responseItem.id = messageEnd.id
          responseItem.annotation = ({
            id: messageEnd.metadata.annotation_reply.id,
            authorName: messageEnd.metadata.annotation_reply.account.name,
          } as AnnotationType)
          const newListWithAnswer = produce(
            getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
            (draft) => {
              if (!draft.find(item => item.id === questionId))
                draft.push({ ...questionItem })

              draft.push({
                ...responseItem,
              })
            })
          setChatList(newListWithAnswer)
          return
        }
        // not support show citation
        // responseItem.citation = messageEnd.retriever_resources
        const newListWithAnswer = produce(
          getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
          (draft) => {
            if (!draft.find(item => item.id === questionId))
              draft.push({ ...questionItem })

            draft.push({ ...responseItem })
          })
        setChatList(newListWithAnswer)
      },
      onMessageReplace: (messageReplace) => {
        setChatList(produce(
          getChatList(),
          (draft) => {
            const current = draft.find(item => item.id === messageReplace.id)

            if (current)
              current.content = messageReplace.answer
          },
        ))
      },
      onError() {
        handleResponding(false)
        // role back placeholder answer
        setChatList(produce(getChatList(), (draft) => {
          draft.splice(draft.findIndex(item => item.id === placeholderAnswerId), 1)
        }))
      },
      onWorkflowStarted: ({ workflow_run_id, task_id }) => {
        taskIdRef.current = task_id
        responseItem.workflow_run_id = workflow_run_id
        responseItem.workflowProcess = {
          status: WorkflowRunningStatus.Running,
          tracing: [],
        }
        setChatList(produce(getChatList(), (draft) => {
          const currentIndex = draft.findIndex(item => item.id === responseItem.id)
          draft[currentIndex] = {
            ...draft[currentIndex],
            ...responseItem,
          }
        }))
      },
      onWorkflowFinished: ({ data }) => {
        responseItem.workflowProcess!.status = data.status as WorkflowRunningStatus
        setChatList(produce(getChatList(), (draft) => {
          const currentIndex = draft.findIndex(item => item.id === responseItem.id)
          draft[currentIndex] = {
            ...draft[currentIndex],
            ...responseItem,
          }
        }))
      },
      onNodeStarted: ({ data }) => {
        responseItem.workflowProcess!.tracing!.push(data as any)
        setChatList(produce(getChatList(), (draft) => {
          const currentIndex = draft.findIndex(item => item.id === responseItem.id)
          draft[currentIndex] = {
            ...draft[currentIndex],
            ...responseItem,
          }
        }))
      },
      onNodeFinished: ({ data }) => {
        const currentIndex = responseItem.workflowProcess!.tracing!.findIndex(item => item.node_id === data.node_id)
        responseItem.workflowProcess!.tracing[currentIndex] = data as any
        setChatList(produce(getChatList(), (draft) => {
          const currentIndex = draft.findIndex(item => item.id === responseItem.id)
          draft[currentIndex] = {
            ...draft[currentIndex],
            ...responseItem,
          }
        }))
      },
    })
  }, [isResponding, notify, t, currInputs, visionConfig, isNewConversation, currConversationId, getChatList, setChatList])

  const handleFeedback = async (messageId: string, feedback: Feedbacktype) => {
    await updateFeedback({ url: `/messages/${messageId}/feedbacks`, body: { rating: feedback.rating } })
    const newChatList = chatList.map((item) => {
      if (item.id === messageId) {
        return {
          ...item,
          feedback,
        }
      }
      return item
    })
    setChatList(newChatList)
    // 根据反馈结果进行提示
    if (feedback.rating) {
      if(feedback.rating === 'like')
        notify({ type: 'success', message: t('common.operation.likeSuccess') })

      if(feedback.rating === 'dislike')
                notify({ type: 'success', message: t('common.operation.dislikeSuccess') })
    }
    else{
          notify({ type: 'success', message: t('common.operation.likeCancel') })
        }
  }
  const handleResponding = useCallback((isResponding: boolean) => {
    setIsResponding(isResponding)
    isRespondingRef.current = isResponding
  }, [])
  const handleStop = useCallback(async () => {
    hasStopResponded.current = true
    handleResponding(false)

    if (taskIdRef.current) {
      console.log('taskIdRef.current', taskIdRef.current)
      try {
        await stopChatMessage(taskIdRef.current, userID['user-id'])
         handleResponding(false)
        notify({ type: 'success', message: t('app.generation.stopped') })
      }
      catch (error) {
              console.error('Failed to stop message:', error)
              notify({ type: 'error', message: t('app.generation.stopFailed') })
            }
     }
 else {
          notify({ type: 'error', message: t('app.generation.stopFailed') })
        }

          if (conversationMessagesAbortControllerRef.current)
            conversationMessagesAbortControllerRef.current.abort()
          if (suggestedQuestionsAbortControllerRef.current)
            suggestedQuestionsAbortControllerRef.current.abort()
        },
      [handleResponding])

  if (appUnavailable)
    return <AppUnavailable isUnknownReason={isUnknownReason} errMessage={!hasSetAppConfig ? 'Please set appId and apiKey in config/index.tsx' : ''} />

  if (!appId || !APP_INFO || !promptConfig)
    return <Loading className='mt-16' type='app' />

  return (
    <div className='flex min-h-screen max-w-full flex-col bg-white' style={{ paddingBottom: `${inputBoxHeight}px` }}>
      <MobilePullToRefresh
        onLoadMore={loadHistoryMessages}
        loadingMore={isLoadingHistory}
        hasMoreData={hasMoreHistory}
        noMoreDataText={t('app.chat.noMoreMessages')}
      >
        {/* 页面内容区域 - 包含所有内容的页面级滚动 */}
        <div className='flex flex-col bg-white'>
          {/* 头部内容 */}
          {headerContent && (
            <div className='shrink-0'>
              {headerContent}
            </div>
          )}

          {/* FAQ内容 */}
          {faqContent && (
            <div className='shrink-0'>
              {faqContent}
            </div>
          )}

          {/* 聊天消息区域 - 占据剩余空间 */}
          <div className='flex-1 p-4'>
            <div className='h-full'>
              <SimpleChat
                chatList={chatList}
                onSend={handleSend}
                onFeedback={handleFeedback}
                isResponding={isResponding}
                checkCanSend={checkCanSend}
                visionConfig={visionConfig}
                isHideSendInput={true}
                showLoadHistoryButton={showLoadHistoryButton}
                isLoadingHistory={isLoadingHistory}
                onLoadHistory={loadHistoryMessages}
                historyMessages={historyMessages}
              />
            </div>
          </div>
        </div>
      </MobilePullToRefresh>

      {/* 固定在窗口底部的输入框 */}
      <div
        ref={inputBoxRef}
        className='fixed bottom-0 left-0 right-0 z-50 p-4'

      >
      {
          chatConfig?.suggested_questions_after_answer?.enabled && !!suggestQuestionsAfterAnswer?.length && (
            <TryToAsk
              suggestedQuestions={suggestQuestionsAfterAnswer}
              onSend={handleSend}
              isMobile={true}
              isLoading={isSuggestQuestionsLoading}
            />
          )
      }

      <OptimizedInput
          onSend={handleSend}
          onStop={handleStop}
          checkCanSend={checkCanSend}
          visionConfig={visionConfig}
          chatConfig={chatConfig}
          isResponding={isResponding}
        />

      </div>
    </div>
  )
}

export default React.memo(Main)
