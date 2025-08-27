import type { IOnCompleted, IOnData, IOnError, IOnFile, IOnMessageEnd, IOnMessageReplace, IOnNodeFinished, IOnNodeStarted, IOnThought, IOnWorkflowFinished, IOnWorkflowStarted } from './base'
import { get, post, postForm, ssePost } from './base'
import type { ChatConfig, Feedbacktype } from '@/types/app'
import type { IAudioToTextResponse } from '@/lib/client'
export const sendChatMessage = async (
  body: Record<string, any>,
  {
    onData,
    onCompleted,
    onThought,
    onFile,
    onError,
    getAbortController,
    onMessageEnd,
    onMessageReplace,
    onWorkflowStarted,
    onNodeStarted,
    onNodeFinished,
    onWorkflowFinished,
  }: {
    onData: IOnData
    onCompleted: IOnCompleted
    onFile: IOnFile
    onThought: IOnThought
    onMessageEnd: IOnMessageEnd
    onMessageReplace: IOnMessageReplace
    onError: IOnError
    getAbortController?: (abortController: AbortController) => void
    onWorkflowStarted: IOnWorkflowStarted
    onNodeStarted: IOnNodeStarted
    onNodeFinished: IOnNodeFinished
    onWorkflowFinished: IOnWorkflowFinished
  },
) => {
  return ssePost('chat-messages', {
    body: {
      ...body,
      response_mode: 'streaming',
    },
  }, { onData, onCompleted, onThought, onFile, onError, getAbortController, onMessageEnd, onMessageReplace, onNodeStarted, onWorkflowStarted, onWorkflowFinished, onNodeFinished })
}

export const fetchConversations = async () => {
  return get('conversations', { params: { limit: 20, last_id: '' } })
}

export const fetchChatList = async (conversationId: string, first_id?: string, limit: number = 5, userID?: string): Promise<{
  limit: number,
  has_more: boolean,
  data: any[],
}> => {
  // first_id  当前页第一条聊天记录的 ID，默认 null
  // limit 每页聊天记录数量，默认 10
  // Response
  // has_more (bool) 是否存在下一页
  // limit (int) 每页聊天记录数量
  return get('messages', { params: { conversation_id: conversationId, first_id, limit, userID } }) as Promise<{
    limit: number,
    has_more: boolean,
    data: any[],
  }>
}

// init value. wait for server update
export const fetchAppParams = async (): Promise<ChatConfig> => {
  return get('parameters') as Promise<ChatConfig>
}

export const updateFeedback = async ({ url, body }: { url: string; body: Feedbacktype }) => {
  return post(url, { body })
}

export const generationConversationName = async (id: string) => {
  return post(`conversations/${id}/name`, { body: { auto_generate: true } })
}

export const stopChatMessage = async (taskId: string) => {
  return post(`chat-messages/${taskId}/stop`)
}

export const fetchSuggestedQuestions = async (messageId: string): Promise<{
  data: string[]
}> => {
  return get(`/suggested-questions/${messageId}`) as Promise<{
    data: string[]
  }>
}

export const audioToText = async (formData: FormData): Promise<IAudioToTextResponse> => {
  console.log('audioToText', formData)
  return postForm('audio-to-text', formData,
  )
}
