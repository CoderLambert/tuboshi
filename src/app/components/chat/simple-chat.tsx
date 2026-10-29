'use client'
import type { FC } from 'react'
import React, { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import cn from 'clsx'
import Answer from './answer'
import Question from './question'
import HistoryMessage from './history-message'
import type { FeedbackFunc } from './type'
import type { ChatItem, VisionFile, VisionSettings } from '@/types/app'

export type ISimpleChatProps = {
  chatList: ChatItem[]
  feedbackDisabled?: boolean
  onFeedback?: FeedbackFunc
  onSend?: (message: string, files?: VisionFile[]) => void
  useCurrentUserAvatar?: boolean
  isResponding?: boolean
  checkCanSend?: () => boolean
  visionConfig?: VisionSettings
  isHideSendInput?: boolean

  // 历史消息加载相关
  showLoadHistoryButton?: boolean
  isLoadingHistory?: boolean
  onLoadHistory?: () => void
  historyMessages?: ChatItem[]
}

const SimpleChat: FC<ISimpleChatProps> = ({
  chatList,
  feedbackDisabled = false,
  onFeedback,
  onSend = () => { },
  useCurrentUserAvatar,
  isResponding,
  showLoadHistoryButton = false,
  isLoadingHistory = false,
  onLoadHistory,
  historyMessages = [],
}) => {
  const { t } = useTranslation()
  const chatListRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部 - 使用 window.scroll
  const scrollToBottom = useCallback(() => {
    const scroller = document.querySelector('.phone-scroll')
    if (scroller instanceof HTMLElement) {
      scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' })
      return
    }
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    })
  }, [])

  // 当消息列表变化时自动滚动到底部
  useEffect(() => {
    if (chatList.length > 0) {
      // 使用双重 requestAnimationFrame 确保 DOM 完全更新后再滚动
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom()
        })
      })
    }
  }, [chatList.length, scrollToBottom])

  // 建议点击处理
  const suggestionClick = useCallback((suggestion: string) => {
    onSend(suggestion, [])
  }, [onSend])

  return (
    <div className={cn(!feedbackDisabled && 'px-3.5', 'relative flex h-full min-w-0 max-w-full flex-col overflow-x-hidden')}>
      {/* 聊天内容区域 */}
      {(chatList.length > 0 || historyMessages.length > 0 || showLoadHistoryButton) && (
        <div className="min-w-0 max-w-full flex-1">
          {/* 历史消息区域 */}
          {historyMessages.length > 0 && (
            <div className="mb-4 border-b border-gray-200 pb-4">
              <div className="mb-3 text-center text-xs text-gray-500">
                {t('app.chat.historyMessages') || '历史消息'}
              </div>
              <div className="space-y-3">
                {historyMessages.map(item => (
                  <HistoryMessage key={item.key} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* 当前聊天消息区域 */}
          <div ref={chatListRef} className="space-y-[30px] pb-4">
            {chatList.map(item => (
              item.isAnswer ? (
                <Answer
                  key={item.id}
                  item={item}
                  feedbackDisabled={feedbackDisabled}
                  onFeedback={onFeedback}
                  isResponding={isResponding && item.id === chatList[chatList.length - 1].id}
                  suggestionClick={suggestionClick}
                />
              ) : (
                <Question
                  key={item.id}
                  id={item.id}
                  content={item.content}
                  useCurrentUserAvatar={useCurrentUserAvatar}
                  imgSrcs={(item.message_files && item.message_files?.length > 0) ? item.message_files.map(file => file.url) : []}
                />
              )
            ))}
            {/* 底部锚点 */}
            <div />
          </div>
        </div>
      )}

      {/* 空状态 */}
      {chatList.length === 0 && historyMessages.length === 0 && !showLoadHistoryButton && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="mb-2 text-lg font-medium">{t('app.chat.startChat') || '试着问问'}</p>
            <p className="text-sm">{t('app.chat.startChatTip') || '发送消息开始聊天，或下拉页面加载历史消息'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(SimpleChat)
