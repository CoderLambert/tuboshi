'use client'
import type { FC } from 'react'
import React, { useCallback, useEffect, useRef } from 'react'
import cn from 'clsx'
import Answer from './answer'
import Question from './question'
import type { FeedbackFunc } from './type'
import type { ChatItem, VisionFile, VisionSettings } from '@/types/app'

export type IChatProps = {
  chatList: ChatItem[]
  /**
   * Whether to display the editing area and rating status
   */
  feedbackDisabled?: boolean
  /**
   * Whether to display the input area
   */
  isHideSendInput?: boolean
  onFeedback?: FeedbackFunc
  checkCanSend?: () => boolean
  onSend?: (message: string, files: VisionFile[]) => void
  useCurrentUserAvatar?: boolean
  isResponding?: boolean
  controlClearQuery?: number
  visionConfig?: VisionSettings
}

const Chat: FC<IChatProps> = ({
  chatList,
  feedbackDisabled = false,
  onFeedback,
  onSend = () => { },
  useCurrentUserAvatar,
  isResponding,
}) => {
  // 简化的页面级滚动实现 + 智能用户交互
  const chatListRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isScrollingProgrammaticallyRef = useRef(false)

  // 智能用户交互状态
  const userScrollPausedRef = useRef(false) // 用户是否主动暂停了自动滚动
  const scrollEventTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollTopRef = useRef(0) // 记录上次滚动位置，用于检测滚动方向

  // 检查是否在页面底部
  const isAtBottom = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight
    return scrollHeight - scrollTop - clientHeight <= 30
  }, [])

  // 简化的页面级滚动到底部（带用户暂停检测）
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    // 如果用户主动暂停了自动滚动，则不执行滚动
    if (userScrollPausedRef.current)
      return

    isScrollingProgrammaticallyRef.current = true

    // 直接滚动到页面底部
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior,
    })

    // 重置标志
    setTimeout(() => {
      isScrollingProgrammaticallyRef.current = false
    }, 50)
  }, [])

  // 用户滚动检测逻辑（仅在AI响应期间启用）
  const handleUserScroll = useCallback(() => {
    if (isScrollingProgrammaticallyRef.current) return

    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
    const lastScrollTop = lastScrollTopRef.current

    // 检测用户向上滚动（更敏感的检测）
    if (currentScrollTop < lastScrollTop - 5) { // 增加5px的阈值，避免微小抖动
      // 用户向上滚动，立即暂停自动滚动
      if (!userScrollPausedRef.current) {
        userScrollPausedRef.current = true
        console.debug('[SmartScroll] User scrolled up, pausing auto-scroll', {
          currentScrollTop,
          lastScrollTop,
          diff: lastScrollTop - currentScrollTop,
        })
      }
    }
 else if (isAtBottom()) {
      // 用户滚动到底部，恢复自动滚动
      if (userScrollPausedRef.current) {
        userScrollPausedRef.current = false
        console.debug('[SmartScroll] User scrolled to bottom, resuming auto-scroll')
      }
    }

    lastScrollTopRef.current = currentScrollTop
  }, [isAtBottom])

  // 更快响应的用户滚动处理（减少防抖时间）
  const debouncedHandleUserScroll = useCallback(() => {
    if (scrollEventTimeoutRef.current)
      clearTimeout(scrollEventTimeoutRef.current)

    scrollEventTimeoutRef.current = setTimeout(handleUserScroll, 50) // 从100ms减少到50ms
  }, [handleUserScroll])

  // 当有新消息时立即滚动到底部（无条件滚动）
  useEffect(() => {
    if (chatList.length > 0) {
      // 使用双重 requestAnimationFrame 确保 DOM 完全更新后再滚动
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom('smooth')
        })
      })
    }
  }, [chatList.length, scrollToBottom])

  // 监听聊天内容 DOM 变更（流式输出实时跟随）- 优化性能
  useEffect(() => {
    const container = chatListRef.current
    if (!container || !isResponding) return

    let scrollTimer: NodeJS.Timeout | null = null

    const observer = new MutationObserver(() => {
      // 检查用户是否暂停了自动滚动
      if (userScrollPausedRef.current) return

      // 防抖优化：避免频繁滚动
      if (scrollTimer) clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        // 再次检查用户是否暂停了自动滚动
        if (!userScrollPausedRef.current)
          scrollToBottom('auto')
      }, 16) // 约60fps的频率
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      observer.disconnect()
      if (scrollTimer) clearTimeout(scrollTimer)
    }
  }, [scrollToBottom, isResponding])

  // 响应时的实时滚动（兜底机制）- 降低频率
  useEffect(() => {
    if (!isResponding) return

    const interval = setInterval(() => {
      // 检查用户是否暂停了自动滚动
      if (!userScrollPausedRef.current)
        scrollToBottom('auto')
    }, 200) // 降低到200ms，减少性能消耗

    return () => clearInterval(interval)
  }, [isResponding, scrollToBottom])

  // 智能用户滚动监听（仅在AI响应期间启用）
  useEffect(() => {
    if (!isResponding) {
      // AI响应结束时，清理状态和事件监听
      userScrollPausedRef.current = false
      if (scrollEventTimeoutRef.current) {
        clearTimeout(scrollEventTimeoutRef.current)
        scrollEventTimeoutRef.current = null
      }
      return
    }

    // AI响应期间，启用用户滚动监听
    console.debug('[SmartScroll] Enabling user scroll detection during AI response')

    // 初始化滚动位置
    lastScrollTopRef.current = window.pageYOffset || document.documentElement.scrollTop

    // 添加滚动事件监听
    window.addEventListener('scroll', debouncedHandleUserScroll, { passive: true })

    return () => {
      // 清理事件监听器
      window.removeEventListener('scroll', debouncedHandleUserScroll)
      if (scrollEventTimeoutRef.current) {
        clearTimeout(scrollEventTimeoutRef.current)
        scrollEventTimeoutRef.current = null
      }
      console.debug('[SmartScroll] Cleaned up user scroll detection')
    }
  }, [isResponding, debouncedHandleUserScroll])

  // Chat组件现在只负责消息显示，输入处理由OptimizedInput组件处理

  const suggestionClick = (suggestion: string) => {
    // 直接调用onSend，不需要设置query状态
    onSend(suggestion, [])
  }

  return (
    <div className={cn(!feedbackDisabled && 'px-3.5', 'relative flex h-full flex-col')}>
      {/* Chat List - 可滚动区域 */}
      {chatList.length > 0 && (
        <div className="relative flex-1">
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
                  imgSrcs={(item.message_files && item.message_files?.length > 0) ? item.message_files.map(item => item.url) : []}
                />
              )
            ))}
            {/* 底部锚点 */}
            <div ref={bottomRef} />

          </div>

          {/* 移除滚动到底部按钮 - 现在无条件自动滚动 */}
        </div>
      )}

      {/* 输入框已移至Main组件，Chat组件只负责消息显示 */}
    </div>
  )
}

export default React.memo(Chat)
