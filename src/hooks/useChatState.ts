import { useReducer, useCallback, useRef } from 'react'
import type { ChatItem, Feedbacktype } from '@/types/app'

/**
 * 聊天状态管理
 * 统一管理所有聊天相关的状态
 */

export interface ChatState {
  // 聊天消息相关
  chatList: ChatItem[]
  historyMessages: ChatItem[]

  // 加载状态
  isLoadingHistory: boolean
  hasMoreHistory: boolean
  showLoadHistoryButton: boolean
  isResponding: boolean
  isSuggestQuestionsLoading: boolean

  // 响应相关
  taskId: string
  abortController: AbortController | null

  // 建议问题
  suggestedQuestionsAfterAnswer: string[]
  openingSuggestedQuestions: string[]

  // 极端错误状态
  hasExtremeError: boolean

  // 会话相关
  isRespondingConIsCurrCon: boolean
  controlFocus: number

  // 用户查询
  userQuery: string
}

// Action 类型定义
export type ChatAction =
  | { type: 'SET_CHAT_LIST'; payload: ChatItem[] }
  | { type: 'ADD_MESSAGE'; payload: ChatItem }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatItem> } }
  | { type: 'SET_HISTORY_MESSAGES'; payload: ChatItem[] }
  | { type: 'ADD_HISTORY_MESSAGES'; payload: ChatItem[] }
  | { type: 'SET_LOADING_HISTORY'; payload: boolean }
  | { type: 'SET_HAS_MORE_HISTORY'; payload: boolean }
  | { type: 'SET_SHOW_LOAD_HISTORY_BUTTON'; payload: boolean }
  | { type: 'SET_RESPONDING'; payload: boolean }
  | { type: 'SET_SUGGESTIONS_LOADING'; payload: boolean }
  | { type: 'SET_TASK_ID'; payload: string }
  | { type: 'SET_ABORT_CONTROLLER'; payload: AbortController | null }
  | { type: 'SET_SUGGESTED_QUESTIONS'; payload: string[] }
  | { type: 'SET_OPENING_SUGGESTED_QUESTIONS'; payload: string[] }
  | { type: 'SET_EXTREME_ERROR'; payload: boolean }
  | { type: 'SET_RESPONDING_CON_IS_CURR_CON'; payload: boolean }
  | { type: 'SET_CONTROL_FOCUS'; payload: number }
  | { type: 'SET_USER_QUERY'; payload: string }
  | { type: 'RESET_CHAT_STATE' }

const initialState: ChatState = {
  chatList: [],
  historyMessages: [],
  isLoadingHistory: false,
  hasMoreHistory: true,
  showLoadHistoryButton: false,
  isResponding: false,
  isSuggestQuestionsLoading: false,
  taskId: '',
  abortController: null,
  suggestedQuestionsAfterAnswer: [],
  openingSuggestedQuestions: [],
  hasExtremeError: false,
  isRespondingConIsCurrCon: true,
  controlFocus: 0,
  userQuery: '',
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CHAT_LIST':
      return { ...state, chatList: action.payload }

    case 'ADD_MESSAGE':
      return { ...state, chatList: [...state.chatList, action.payload] }

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        chatList: state.chatList.map(msg =>
          msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
        )
      }

    case 'SET_HISTORY_MESSAGES':
      return { ...state, historyMessages: action.payload }

    case 'ADD_HISTORY_MESSAGES':
      return { ...state, historyMessages: [...action.payload, ...state.historyMessages] }

    case 'SET_LOADING_HISTORY':
      return { ...state, isLoadingHistory: action.payload }

    case 'SET_HAS_MORE_HISTORY':
      return { ...state, hasMoreHistory: action.payload }

    case 'SET_SHOW_LOAD_HISTORY_BUTTON':
      return { ...state, showLoadHistoryButton: action.payload }

    case 'SET_RESPONDING':
      return { ...state, isResponding: action.payload }

    case 'SET_SUGGESTIONS_LOADING':
      return { ...state, isSuggestQuestionsLoading: action.payload }

    case 'SET_TASK_ID':
      return { ...state, taskId: action.payload }

    case 'SET_ABORT_CONTROLLER':
      return { ...state, abortController: action.payload }

    case 'SET_SUGGESTED_QUESTIONS':
      return { ...state, suggestedQuestionsAfterAnswer: action.payload }

    case 'SET_OPENING_SUGGESTED_QUESTIONS':
      return { ...state, openingSuggestedQuestions: action.payload }

    case 'SET_EXTREME_ERROR':
      return { ...state, hasExtremeError: action.payload }

    case 'SET_RESPONDING_CON_IS_CURR_CON':
      return { ...state, isRespondingConIsCurrCon: action.payload }

    case 'SET_CONTROL_FOCUS':
      return { ...state, controlFocus: action.payload }

    case 'SET_USER_QUERY':
      return { ...state, userQuery: action.payload }

    case 'RESET_CHAT_STATE':
      return {
        ...initialState,
        suggestedQuestionsAfterAnswer: state.suggestedQuestionsAfterAnswer,
        openingSuggestedQuestions: state.openingSuggestedQuestions,
      }

    default:
      return state
  }
}

export function useChatState() {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  // Refs for preventing closure issues
  const isLoadingHistoryRef = useRef(false)
  const isRespondingRef = useRef(false)
  const hasStopResponded = useRef(false)

  // 同步 ref 到 state
  const updateRefs = useCallback(() => {
    isLoadingHistoryRef.current = state.isLoadingHistory
    isRespondingRef.current = state.isResponding
  }, [state.isLoadingHistory, state.isResponding])

  // Action creators
  const actions = {
    setChatList: (chatList: ChatItem[]) => {
      dispatch({ type: 'SET_CHAT_LIST', payload: chatList })
    },

    addMessage: (message: ChatItem) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message })
    },

    updateMessage: (id: string, updates: Partial<ChatItem>) => {
      dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } })
    },

    setHistoryMessages: (historyMessages: ChatItem[]) => {
      dispatch({ type: 'SET_HISTORY_MESSAGES', payload: historyMessages })
    },

    addHistoryMessages: (historyMessages: ChatItem[]) => {
      dispatch({ type: 'ADD_HISTORY_MESSAGES', payload: historyMessages })
    },

    setLoadingHistory: (isLoading: boolean) => {
      dispatch({ type: 'SET_LOADING_HISTORY', payload: isLoading })
    },

    setHasMoreHistory: (hasMore: boolean) => {
      dispatch({ type: 'SET_HAS_MORE_HISTORY', payload: hasMore })
    },

    setShowLoadHistoryButton: (show: boolean) => {
      dispatch({ type: 'SET_SHOW_LOAD_HISTORY_BUTTON', payload: show })
    },

    setResponding: (isResponding: boolean) => {
      dispatch({ type: 'SET_RESPONDING', payload: isResponding })
      isRespondingRef.current = isResponding
    },

    setSuggestionsLoading: (isLoading: boolean) => {
      dispatch({ type: 'SET_SUGGESTIONS_LOADING', payload: isLoading })
    },

    setTaskId: (taskId: string) => {
      dispatch({ type: 'SET_TASK_ID', payload: taskId })
    },

    setAbortController: (controller: AbortController | null) => {
      dispatch({ type: 'SET_ABORT_CONTROLLER', payload: controller })
    },

    setSuggestedQuestions: (questions: string[]) => {
      dispatch({ type: 'SET_SUGGESTED_QUESTIONS', payload: questions })
    },

    setOpeningSuggestedQuestions: (questions: string[]) => {
      dispatch({ type: 'SET_OPENING_SUGGESTED_QUESTIONS', payload: questions })
    },

    setExtremeError: (hasError: boolean) => {
      dispatch({ type: 'SET_EXTREME_ERROR', payload: hasError })
    },

    setRespondingConIsCurrCon: (isCurrCon: boolean) => {
      dispatch({ type: 'SET_RESPONDING_CON_IS_CURR_CON', payload: isCurrCon })
    },

    setControlFocus: (focus: number) => {
      dispatch({ type: 'SET_CONTROL_FOCUS', payload: focus })
    },

    setUserQuery: (query: string) => {
      dispatch({ type: 'SET_USER_QUERY', payload: query })
    },

    resetChatState: () => {
      dispatch({ type: 'RESET_CHAT_STATE' })
    },
  }

  // Update refs when state changes
  updateRefs()

  return {
    state,
    actions,
    refs: {
      isLoadingHistoryRef,
      isRespondingRef,
      hasStopResponded,
    }
  }
}