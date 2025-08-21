'use client'
import type { FC } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { animated, useSpring } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import cn from 'clsx'
import Answer from './answer'
import Question from './question'
import HistoryMessage from './history-message'
import type { FeedbackFunc } from './type'
import type { ChatItem, VisionFile, VisionSettings } from '@/types/app'
import Loading from '@/app/components/base/loading'

export type ISimplePullToRefreshChatProps = {
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

  // 下拉加载历史消息相关
  onLoadMore?: () => Promise<void>
  loadingMore?: boolean
}

const SimplePullToRefreshChat: FC<ISimplePullToRefreshChatProps> = ({
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
  onLoadMore,
  loadingMore = false,
}) => {
  const { t } = useTranslation()
  const chatListRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 禁用浏览器默认的下拉刷新
  useEffect(() => {
    // 添加CSS样式禁用下拉刷新（更温和的方式）
    const style = document.createElement('style')
    style.textContent = `
      .pull-to-refresh-container {
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
      }
    `
    document.head.appendChild(style)

    const preventPullToRefresh = (e: TouchEvent) => {
      // 只在特定条件下阻止默认行为
      if (containerRef.current && e.touches.length === 1) {
        const scrollTop = containerRef.current.scrollTop
        const target = e.target as Element

        // 检查触摸是否发生在我们的容器内，且在顶部，且是向下拖拽
        if (containerRef.current.contains(target) && scrollTop === 0) {
          // 只有在检测到向下拖拽时才阻止默认行为
          const touch = e.touches[0]
          const startY = touch.clientY

          // 存储初始触摸位置
          if (e.type === 'touchstart') {
            containerRef.current.dataset.startY = startY.toString()
          }
 else if (e.type === 'touchmove') {
            const savedStartY = Number.parseFloat(containerRef.current.dataset.startY || '0')
            const deltaY = touch.clientY - savedStartY

            // 只有在向下拖拽超过10px时才阻止默认行为
            if (deltaY > 10)
              e.preventDefault()
          }
        }
      }
    }

    // 添加触摸事件监听器
    document.addEventListener('touchstart', preventPullToRefresh, { passive: false })
    document.addEventListener('touchmove', preventPullToRefresh, { passive: false })

    return () => {
      document.removeEventListener('touchstart', preventPullToRefresh)
      document.removeEventListener('touchmove', preventPullToRefresh)
      document.head.removeChild(style)
    }
  }, [])

  // 下拉刷新状态
  const [isPulling, setIsPulling] = useState(false)
  const [canRelease, setCanRelease] = useState(false)

  // Spring动画
  const [{ y }, api] = useSpring(() => ({ y: 0 }))

  // 建议点击处理
  const suggestionClick = useCallback((suggestion: string) => {
    onSend(suggestion, [])
  }, [onSend])

  // 下拉加载历史消息处理
  const handleLoadMore = useCallback(async () => {
    if (onLoadMore && !isLoadingHistory) {
      setIsPulling(true)
      try {
        await onLoadMore()
      }
 finally {
        setIsPulling(false)
        setCanRelease(false)
        api.start({ y: 0 })
      }
    }
  }, [onLoadMore, isLoadingHistory, api])

  // 拖拽手势
  const bind = useDrag(
    ({ down, movement: [, my] }) => {
      // 只在向下拖拽且在容器顶部时生效
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop
        if (scrollTop > 0) return // 不在顶部时不响应
      }

      if (down && my > 0) {
        // 正在拖拽
        const pullDistance = Math.min(my, 120) // 最大拖拽距离120px
        setIsPulling(true)
        setCanRelease(pullDistance > 80) // 超过80px可以释放
        api.start({ y: pullDistance, immediate: true })
      }
 else {
        // 释放拖拽
        if (canRelease && onLoadMore && !isLoadingHistory) {
          handleLoadMore()
        }
 else {
          setIsPulling(false)
          setCanRelease(false)
          api.start({ y: 0 })
        }
      }
    },
    {
      axis: 'y',
      bounds: { top: 0 },
      rubberband: true,
      // 添加更精确的手势识别
      filterTaps: true,
      threshold: 10, // 需要移动10px才开始识别
    },
  )

  // 渲染刷新指示器
  const renderRefreshIndicator = () => {
    if (!isPulling && !isLoadingHistory) return null

    if (isLoadingHistory) {
      return (
        <div className="flex flex-col items-center justify-center py-4">
          <Loading type="area" />
          <span className="mt-2 text-sm text-blue-600">
            {t('app.chat.loadingMoreHistory') || '正在加载更多历史消息...'}
          </span>
        </div>
      )
    }

    if (canRelease) {
      return (
        <div className="flex flex-col items-center justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          <span className="mt-2 text-sm text-green-600">
            {t('app.chat.releaseToLoadMore') || '释放加载更多历史消息'}
          </span>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-4">
        <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="mt-2 text-sm text-gray-600">
          {t('app.chat.pullToLoadMore') || '下拉加载更多历史消息'}
        </span>
      </div>
    )
  }

  return (
    <div className={cn(!feedbackDisabled && 'px-3.5', 'relative flex h-full flex-col')}>
      {/* 聊天内容区域 */}
      {(chatList.length > 0 || historyMessages.length > 0 || showLoadHistoryButton) && (
        <animated.div
          ref={containerRef}
          {...bind()}
          style={{ y }}
          className="pull-to-refresh-container flex-1 touch-pan-y overflow-y-auto"
        >
          {/* 下拉刷新指示器 */}
          <div className="sticky top-0 z-10 bg-white">
            {renderRefreshIndicator()}
          </div>

          {/* 历史消息加载按钮（备用方案） */}
          {showLoadHistoryButton && !onLoadMore && (
            <div className="flex justify-center py-2">
              <button
                onClick={onLoadHistory}
                disabled={isLoadingHistory}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                  isLoadingHistory
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                    : 'border-gray-300 bg-white text-gray-700 shadow-sm hover:border-gray-400 hover:bg-gray-50',
                )}
              >
                {isLoadingHistory ? (
                  <>
                    <Loading type="area" />
                    <span>{t('app.chat.loadingHistory') || '加载中...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span>{t('app.chat.loadHistoryMessages') || '查看历史消息'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 历史消息区域 */}
          {historyMessages.length > 0 && (
            <div className="mb-4 border-b border-gray-200 pb-4">
              <div className="mb-3 text-center text-xs text-gray-500">
                {t('app.chat.historyMessages') || '历史消息'}
              </div>
              <div className="space-y-3">
                {historyMessages.map(item => (
                  <HistoryMessage key={item.key || item.id} item={item} />
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
        </animated.div>
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
            <p className="mb-2 text-lg font-medium">开始对话</p>
            <p className="text-sm">发送消息开始聊天，或下拉加载更多历史消息</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(SimplePullToRefreshChat)
