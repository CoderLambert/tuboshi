import { useCallback, useRef } from 'react'
import { produce } from 'immer'
import { useTranslation } from 'react-i18next'
import { useGetState } from 'ahooks'
import { useAppStore } from '@/hooks/useAppStore'
import Toast from '@/app/components/base/toast'
import {
  sendChatMessage,
  stopChatMessage,
  updateFeedback,
  fetchSuggestedQuestions,
  fetchConversations,
  generationConversationName
} from '@/services'
import type { ChatItem, Feedbacktype, VisionFile, VisionSettings } from '@/types/app'
import { TransferMethod, WorkflowRunningStatus } from '@/types/app'
import { addFileInfos, sortAgentSorts } from '@/utils/tools'
import type { Annotation as AnnotationType } from '@/types/log'
import { userInputsFormToPromptVariables } from '@/utils/prompt'
import { promptTemplate } from '@/config'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import type { ChatConfig, PromptConfig } from '@/types/app'
import type { ChatState, ChatAction } from './useChatState'

/**
 * 消息处理器类型定义
 */
export interface MessageHandlersConfig {
  // 基础配置
  appId?: string
  apiUrl?: string
  apiKey?: string

  // 状态和函数
  chatState: ChatState
  chatActions: ReturnType<typeof import('./useChatState').useChatState>['actions']
  currInputs: Record<string, any> | null
  setCurrInputs: (inputs: Record<string, any> | null) => void
  newConversationInputs: Record<string, any> | null
  resetNewConversationInputs: () => void
  getCurrConversationId: () => string
  setCurrConversationId: (id: string, appId: string, save?: boolean) => void
  setConversationIdChangeBecauseOfNew: (value: boolean) => void
  setChatNotStarted: () => void
  setExistConversationInfo: (info: any) => void
  setConversationList: (list: any[]) => void
  visionConfig?: VisionSettings
  chatConfig?: ChatConfig
  promptConfig?: PromptConfig
}

/**
 * 文件转换工具
 */
function transformToServerFile(fileItem: any) {
  return {
    type: 'image',
    transfer_method: fileItem.transferMethod,
    url: fileItem.url,
    upload_file_id: fileItem.id,
  }
}

/**
 * 生成开场白消息列表
 */
function generateNewChatListWithOpenStatement(introduction?: string, inputs?: Record<string, any> | null) {
  return []
}

/**
 * 消息处理器 Hook
 */
export function useMessageHandlers(config: MessageHandlersConfig) {
  const { t } = useTranslation()
  const { notify } = Toast
  const { useInputsFormConfig } = useNativeBridge()
  const inputsFormConfig = useInputsFormConfig()
  const userID = useAppStore((state: any) => state.userID)

  // Refs for managing state
  const currentQueryRef = useRef('')
  const taskIdRef = useRef('')

  // 处理文件验证
  const validateFiles = useCallback((files?: VisionFile[]) => {
    if (!files || files.length === 0) return { valid: true, files: undefined }

    // 过滤出有效的文件
    const validFiles = files.filter(file =>
      file.transfer_method === TransferMethod.local_file
        ? file.upload_file_id && file.upload_file_id !== ''
        : true,
    )

    // 如果过滤后文件数量减少，说明有无效文件
    if (validFiles.length !== files.length) {
      notify({ type: 'error', message: t('app.chat.uploadImgWaitInfo') })
      return { valid: false, files: undefined }
    }

    // 确保所有本地文件都有 upload_file_id
    const hasInvalidLocalFiles = validFiles.some(file =>
      file.transfer_method === TransferMethod.local_file
        && (!file.upload_file_id || file.upload_file_id === ''),
    )

    if (hasInvalidLocalFiles) {
      notify({ type: 'error', message: t('app.chat.uploadImgWaitInfo') })
      return { valid: false, files: undefined }
    }

    return { valid: true, files: validFiles }
  }, [notify, t])

  // 处理反馈
  const handleFeedback = useCallback(async (messageId: string, feedback: Feedbacktype, chatList: ChatItem[], setChatList: (list: ChatItem[]) => void) => {
    try {
      await updateFeedback({ url: `/messages/${messageId}/feedbacks`, body: { rating: feedback.rating } })

      const newChatList = chatList.map((item) => {
        if (item.id === messageId) {
          return { ...item, feedback }
        }
        return item
      })

      setChatList(newChatList)

      // 根据反馈结果进行提示
      if (feedback.rating) {
        if (feedback.rating === 'like') {
          notify({ type: 'success', message: t('common.operation.likeSuccess') })
        }
        if (feedback.rating === 'dislike') {
          notify({ type: 'success', message: t('common.operation.dislikeSuccess') })
        }
      } else {
        notify({ type: 'success', message: t('common.operation.likeCancel') })
      }
    } catch (error) {
      console.error('Failed to update feedback:', error)
      notify({ type: 'error', message: t('app.errorMessage.feedbackFailed') || '反馈提交失败' })
    }
  }, [notify, t])

  // 处理停止响应
  const handleStop = useCallback(async () => {
    const { chatActions } = config
    const { refs } = config as any // 获取 refs

    refs.hasStopResponded.current = true
    chatActions.setResponding(false)

    if (taskIdRef.current) {
      console.log('taskIdRef.current', taskIdRef.current)
      try {
        await stopChatMessage(taskIdRef.current)
        chatActions.setResponding(false)
        notify({ type: 'success', message: t('app.generation.stopped') })
      } catch (error) {
        console.error('Failed to stop message:', error)
        notify({ type: 'error', message: t('app.generation.stopFailed') })
      }
    } else {
      notify({ type: 'error', message: t('app.generation.stopFailed') })
    }

    // 中止相关的请求
    if (config.chatState.abortController) {
      config.chatState.abortController.abort()
    }
  }, [config, notify, t])

  // 处理建议问题
  const handleSuggestedQuestions = useCallback(async (messageId: string) => {
    const { chatActions } = config

    try {
      chatActions.setSuggestionsLoading(true)
      console.log(`Loading suggested questions for message: ${messageId}`)

      const { data } = await fetchSuggestedQuestions(messageId)
      chatActions.setSuggestedQuestions(data)
    } catch (error) {
      console.error('Failed to fetch suggested questions:', error)
      chatActions.setSuggestedQuestions([])
      notify({
        type: 'error',
        message: t('app.errorMessage.suggestionMessageError'),
      })
    } finally {
      chatActions.setSuggestionsLoading(false)
    }
  }, [config, notify, t])

  // 处理会话创建后的更新
  const handleConversationCreation = useCallback(async (tempNewConversationId: string, firstMessageContent: string) => {
    const { setConversationList, setExistConversationInfo } = config

    try {
      // 获取最新的会话列表
      const { data: allConversations }: any = await fetchConversations()
      console.log('获取到最新会话列表:', allConversations)

      // 如果新会话不在列表中，重新获取
      const newConversationExists = allConversations.some((conv: any) => conv.id === tempNewConversationId)

      if (!newConversationExists) {
        console.log('新会话未在列表中，重新获取...')
        setTimeout(async () => {
          try {
            const { data: refreshedConversations }: any = await fetchConversations()
            setConversationList(refreshedConversations)
            console.log('刷新会话列表完成')
          } catch (error) {
            console.error('刷新会话列表失败:', error)
          }
        }, 1000)
      } else {
        setConversationList(allConversations)
        console.log('直接更新会话列表完成')
      }

      // 尝试生成会话名称
      const newConversationIndex = allConversations.findIndex((conv: any) => conv.id === tempNewConversationId)
      if (newConversationIndex !== -1) {
        try {
          console.log(`找到新会话在列表中的位置: ${newConversationIndex}，尝试生成会话名称`)
          const newItem: any = await generationConversationName(tempNewConversationId)
          const newAllConversations = produce(allConversations, (draft: any) => {
            if (draft[newConversationIndex].id === tempNewConversationId) {
              draft[newConversationIndex].name = newItem.name
            }
          })
          setConversationList(newAllConversations)
          console.log('更新会话名称完成:', newItem.name)

          setExistConversationInfo({
            name: newItem.name,
            introduction: '',
            suggested_questions: [],
          })
          console.log('更新当前会话标题完成:', newItem.name)
        } catch (error) {
          console.error('生成会话名称失败:', error)

          // 使用第一条消息作为标题
          if (firstMessageContent && newConversationIndex !== -1) {
            const truncatedTitle = firstMessageContent.length > 20 ? firstMessageContent.substring(0, 20) + '...' : firstMessageContent
            const newAllConversations = produce(allConversations, (draft: any) => {
              if (draft[newConversationIndex].id === tempNewConversationId) {
                draft[newConversationIndex].name = truncatedTitle
              }
            })
            setConversationList(newAllConversations)
            console.log('使用消息内容作为会话标题:', truncatedTitle)

            setExistConversationInfo({
              name: truncatedTitle,
              introduction: '',
              suggested_questions: [],
            })
          }
        }
      } else {
        console.warn('未找到新会话在列表中的位置:', tempNewConversationId)
      }
    } catch (error) {
      console.error('更新会话列表失败:', error)
    }
  }, [config])

  // 更新当前问答
  const updateCurrentQA = useCallback((
    responseItem: ChatItem,
    questionId: string,
    placeholderAnswerId: string,
    questionItem: ChatItem,
    chatList: ChatItem[],
    setChatList: (list: ChatItem[]) => void
  ) => {
    // 添加内容检查，避免创建空内容的消息
    if (!responseItem.content && !responseItem.agent_thoughts?.length && !responseItem.message_files?.length) {
      console.log('Empty responseItem, not updating UI')
      console.log(responseItem)
      return
    }

    const newListWithAnswer = produce(
      chatList.filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
      (draft) => {
        if (!draft.find(item => item.id === questionId)) {
          draft.push({ ...questionItem })
        }
        draft.push({ ...responseItem })
      }
    )
    setChatList(newListWithAnswer)
  }, [])

  // 主要的消息发送处理器
  const handleSend = useCallback(async (message: string, files?: VisionFile[]) => {
    const {
      appId,
      apiUrl,
      visionConfig,
      chatConfig,
      currInputs,
      setCurrInputs,
      resetNewConversationInputs,
      getCurrConversationId,
      setCurrConversationId,
      setConversationIdChangeBecauseOfNew,
      setChatNotStarted,
      setExistConversationInfo,
      setConversationList,
      chatState,
      chatActions
    } = config

    if (!appId || !apiUrl) {
      notify({ type: 'error', message: 'App configuration not ready' })
      return
    }

    // 重置极端错误状态
    chatActions.setExtremeError(false)

    // 验证文件
    const fileValidation = validateFiles(files)
    if (!fileValidation.valid) {
      return
    }
    files = fileValidation.files

    // 检查是否正在响应
    if (chatState.isResponding) {
      notify({ type: 'info', message: t('app.errorMessage.waitForResponse') })
      return
    }

    // 设置响应状态
    chatActions.setResponding(true)
    currentQueryRef.current = ''
    chatActions.setSuggestionsLoading(false)
    chatActions.setSuggestedQuestions([])

    // 构建服务器输入数据
    const toServerInputs: Record<string, any> = {
      ...inputsFormConfig,
    }

    if (currInputs) {
      Object.keys(currInputs).forEach((key) => {
        const value = currInputs[key]
        if (value.supportFileType) {
          toServerInputs[key] = transformToServerFile(value)
        } else if (value[0]?.supportFileType) {
          toServerInputs[key] = value.map((item: any) => transformToServerFile(item))
        } else {
          toServerInputs[key] = value
        }
      })
    }

    // 确定是否为新会话
    const isActuallyNewConversation = getCurrConversationId() === '-1'
    console.log('发送消息时 - currConversationId:', getCurrConversationId(), 'isActuallyNewConversation:', isActuallyNewConversation)

    // 如果是新会话，设置状态标记
    if (isActuallyNewConversation) {
      setConversationIdChangeBecauseOfNew(true)
    }

    // 构建请求数据
    const data: Record<string, any> = {
      inputs: {
        ...toServerInputs,
        ...inputsFormConfig,
      },
      query: message,
      conversation_id: isActuallyNewConversation ? null : getCurrConversationId(),
    }

    // 添加文件数据
    if (visionConfig?.enabled && files && files?.length > 0) {
      data.files = files.map((item) => {
        if (item.transfer_method === TransferMethod.local_file) {
          return { ...item, url: '' }
        }
        return item
      })
    }

    // 创建问题消息
    const questionId = `question-${Date.now()}`
    const questionItem = {
      id: questionId,
      content: message,
      isAnswer: false,
      message_files: files,
    }

    // 创建占位符回答消息
    const placeholderAnswerId = `answer-placeholder-${Date.now()}`
    const placeholderAnswerItem = {
      id: placeholderAnswerId,
      content: '',
      isAnswer: true,
    }

    // 更新聊天列表
    const newList = [...chatState.chatList, questionItem, placeholderAnswerItem]
    chatActions.setChatList(newList)

    // 回答消息对象
    const responseItem: ChatItem = {
      id: `${Date.now()}`,
      content: '',
      agent_thoughts: [],
      message_files: [],
      isAnswer: true,
    }

    let hasSetResponseId = false
    let isAgentMode = false
    const prevTempNewConversationId = getCurrConversationId() || '-1'
    let tempNewConversationId = ''
    const firstMessageContent = message // 保存消息内容用于生成标题

    console.log(`data ---> ${JSON.stringify(data)}`)

    // 发送消息
    sendChatMessage(data, {
      getAbortController: (abortController) => {
        chatActions.setAbortController(abortController)
      },
      onData: (message: string, isFirstMessage: boolean, { conversationId: newConversationId, messageId, taskId }: any) => {
        if (!isAgentMode) {
          responseItem.content = responseItem.content + message
        } else {
          const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
          if (lastThought) {
            lastThought.thought = lastThought.thought + message
          }
        }

        if (messageId && !hasSetResponseId) {
          responseItem.id = messageId
          hasSetResponseId = true
        }

        if (isFirstMessage && newConversationId) {
          tempNewConversationId = newConversationId
          console.log(`tempNewConversationId ---> ${tempNewConversationId}`)
        }

        taskIdRef.current = taskId

        // 检查是否已切换到其他会话
        if (prevTempNewConversationId !== getCurrConversationId()) {
          chatActions.setRespondingConIsCurrCon(false)
          return
        }

        updateCurrentQA({
          responseItem,
          questionId,
          placeholderAnswerId,
          questionItem,
        }, chatState.chatList, chatActions.setChatList)
      },
      async onCompleted(hasError?: boolean) {
        if (hasError) {
          chatActions.setResponding(false)
          return
        }

        // 处理新会话创建
        if (tempNewConversationId && tempNewConversationId !== getCurrConversationId()) {
          console.log('新建会话完成，更新会话列表...')
          await handleConversationCreation(tempNewConversationId, firstMessageContent)
        }

        setConversationIdChangeBecauseOfNew(false)
        resetNewConversationInputs()
        setChatNotStarted()

        // 更新会话ID
        if (tempNewConversationId && tempNewConversationId !== getCurrConversationId()) {
          console.log('更新会话ID从', getCurrConversationId(), '到', tempNewConversationId)
          setCurrConversationId(tempNewConversationId, appId, true)
        }

        chatActions.setResponding(false)

        // 获取建议问题
        if (chatConfig?.suggested_questions_after_answer?.enabled && !taskIdRef.current) {
          if (responseItem && responseItem?.id) {
            await handleSuggestedQuestions(responseItem.id)
          } else {
            Toast.notify({
              type: 'error',
              message: t('app.errorMessage.suggestionMessageError'),
            })
          }
        }
      },
      onFile(file) {
        const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
        if (lastThought) {
          lastThought.message_files = [...(lastThought as any).message_files, { ...file }]
        }

        updateCurrentQA({
          responseItem,
          questionId,
          placeholderAnswerId,
          questionItem,
        }, chatState.chatList, chatActions.setChatList)
      },
      onThought(thought) {
        isAgentMode = true
        const response = responseItem as any

        if (thought.message_id && !hasSetResponseId) {
          response.id = thought.message_id
          hasSetResponseId = true
        }

        if (response.agent_thoughts.length === 0) {
          response.agent_thoughts.push(thought)
        } else {
          const lastThought = response.agent_thoughts[response.agent_thoughts.length - 1]
          if (lastThought.id === thought.id) {
            thought.thought = lastThought.thought
            thought.message_files = lastThought.message_files
            responseItem.agent_thoughts![response.agent_thoughts.length - 1] = thought
          } else {
            response.agent_thoughts!.push(thought)
          }
        }

        if (prevTempNewConversationId !== getCurrConversationId()) {
          chatActions.setRespondingConIsCurrCon(false)
          return false
        }

        updateCurrentQA({
          responseItem,
          questionId,
          placeholderAnswerId,
          questionItem,
        }, chatState.chatList, chatActions.setChatList)
      },
      onMessageEnd: (messageEnd) => {
        if (messageEnd.metadata?.annotation_reply) {
          responseItem.id = messageEnd.id
          responseItem.annotation = ({
            id: messageEnd.metadata.annotation_reply.id,
            authorName: messageEnd.metadata.annotation_reply.account.name,
          } as AnnotationType)

          const newListWithAnswer = produce(
            chatState.chatList.filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
            (draft) => {
              if (!draft.find(item => item.id === questionId)) {
                draft.push({ ...questionItem })
              }
              draft.push({
                ...responseItem,
              })
            }
          )
          chatActions.setChatList(newListWithAnswer)
          return
        }

        const newListWithAnswer = produce(
          chatState.chatList.filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
          (draft) => {
            if (!draft.find(item => item.id === questionId)) {
              draft.push({ ...questionItem })
            }
            draft.push({ ...responseItem })
          }
        )
        chatActions.setChatList(newListWithAnswer)
      },
      onMessageReplace: (messageReplace) => {
        chatActions.setChatList(produce(
          chatState.chatList,
          (draft) => {
            const current = draft.find(item => item.id === messageReplace.id)
            if (current) {
              current.content = messageReplace.answer
            }
          },
        ))
      },
      onError() {
        chatActions.setResponding(false)
        chatActions.setExtremeError(true)

        // 将占位符替换为错误消息
        chatActions.setChatList(produce(chatState.chatList, (draft) => {
          const placeholderIndex = draft.findIndex(item => item.id === placeholderAnswerId)
          if (placeholderIndex !== -1) {
            draft[placeholderIndex] = {
              ...draft[placeholderIndex],
              content: '抱歉，消息发送遇到问题。您可以继续发送其他消息。',
              isError: true,
            }
          }
        }))
      },
      onWorkflowStarted: ({ workflow_run_id, task_id }) => {
        taskIdRef.current = task_id
        responseItem.workflow_run_id = workflow_run_id
        responseItem.workflowProcess = {
          status: WorkflowRunningStatus.Running,
          tracing: [],
        }
        chatActions.setChatList(produce(chatState.chatList, (draft) => {
          const currentIndex = draft.findIndex(item => item.id === responseItem.id)
          draft[currentIndex] = {
            ...draft[currentIndex],
            ...responseItem,
          }
        }))
      },
      onWorkflowFinished: ({ data }) => {
        responseItem.workflowProcess!.status = data.status as WorkflowRunningStatus
        chatActions.setChatList(produce(chatState.chatList, (draft) => {
          const currentIndex = draft.findIndex(item => item.id === responseItem.id)
          draft[currentIndex] = {
            ...draft[currentIndex],
            ...responseItem,
          }
        }))
      },
      onNodeStarted: ({ data }) => {
        responseItem.workflowProcess!.tracing!.push(data as any)
        chatActions.setChatList(produce(chatState.chatList, (draft) => {
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
        chatActions.setChatList(produce(chatState.chatList, (draft) => {
          const currentIndex = draft.findIndex(item => item.id === responseItem.id)
          draft[currentIndex] = {
            ...draft[currentIndex],
            ...responseItem,
          }
        }))
      },
    })
  }, [config, validateFiles, updateCurrentQA, handleConversationCreation, handleSuggestedQuestions, notify, t])

  return {
    handleSend,
    handleStop,
    handleFeedback,
    handleSuggestedQuestions,
    currentQueryRef,
    taskIdRef,
  }
}