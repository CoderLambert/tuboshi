'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { animated, useSpring } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import cn from 'clsx'
import Loading from '@/app/components/base/loading'

export type IPagePullToRefreshProps = {
  children: React.ReactNode
  onLoadMore?: () => Promise<void>
  loadingMore?: boolean
  hasMoreData?: boolean // 是否还有更多数据
  noMoreDataText?: string // 无更多数据时的提示文案
  className?: string
}

const PagePullToRefresh: React.FC<IPagePullToRefreshProps> = ({
  children,
  onLoadMore,
  loadingMore = false,
  hasMoreData = true,
  noMoreDataText,
  className,
}) => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)

  // 下拉状态
  const [isPulling, setIsPulling] = useState(false)
  const [canRelease, setCanRelease] = useState(false)
  const [showNoMoreData, setShowNoMoreData] = useState(false)

  // Spring动画
  const [{ y }, api] = useSpring(() => ({ y: 0 }))

  // 禁用浏览器默认的下拉刷新
  useEffect(() => {
    // 添加页面级CSS样式 - 增强移动端支持
    const style = document.createElement('style')
    style.textContent = `
      body {
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
      }
      .page-pull-to-refresh {
        overscroll-behavior-y: none;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
        /* 确保移动端触摸事件正常工作 */
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        /* 防止移动端长按菜单 */
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
    `
    document.head.appendChild(style)

    const preventPullToRefresh = (e: TouchEvent) => {
      // 页面级别的下拉刷新控制
      if (e.touches.length === 1) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop

        // 只在页面顶部时阻止默认行为
        if (scrollTop === 0) {
          const touch = e.touches[0]
          const startY = touch.clientY

          if (e.type === 'touchstart') {
            document.body.dataset.startY = startY.toString()
            // 立即阻止默认行为，防止浏览器下拉刷新
            e.preventDefault()
          }
 else if (e.type === 'touchmove') {
            const savedStartY = Number.parseFloat(document.body.dataset.startY || '0')
            const deltaY = touch.clientY - savedStartY

            // 只要是向下拖拽就阻止默认行为
            if (deltaY > 0) {
              e.preventDefault()
              e.stopPropagation()
            }
          }
        }
      }
    }

    // 添加页面级触摸事件监听器
    document.addEventListener('touchstart', preventPullToRefresh, { passive: false })
    document.addEventListener('touchmove', preventPullToRefresh, { passive: false })

    return () => {
      document.removeEventListener('touchstart', preventPullToRefresh)
      document.removeEventListener('touchmove', preventPullToRefresh)
      if (document.head.contains(style))
        document.head.removeChild(style)
    }
  }, [])

  // 下拉加载处理
  const handleLoadMore = useCallback(async () => {
    if (!hasMoreData) {
      // 显示无更多数据提示
      setShowNoMoreData(true)
      setTimeout(() => {
        setShowNoMoreData(false)
        setIsPulling(false)
        setCanRelease(false)
        api.start({ y: 0 })
      }, 2000) // 2秒后隐藏提示
      return
    }

    if (onLoadMore && !loadingMore) {
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
  }, [onLoadMore, loadingMore, hasMoreData, api])

  // 页面级拖拽手势 - 增强移动端支持
  const bind = useDrag(
    ({ down, movement: [, my], event, first }) => {
      // 检查是否在页面顶部
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      if (scrollTop > 0) return // 不在顶部时不响应

      // 移动端特殊处理
      if (event && 'touches' in event) {
        // 阻止移动端浏览器的默认下拉刷新
        if (first && scrollTop === 0)
          event.preventDefault()
      }

      if (down && my > 0) {
        // 正在拖拽
        const pullDistance = Math.min(my, 150) // 最大拖拽距离150px
        setIsPulling(true)
        setCanRelease(pullDistance > 80) // 超过80px可以释放
        api.start({ y: pullDistance, immediate: true })
      }
 else {
        // 释放拖拽
        if (canRelease) {
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
      filterTaps: true,
      threshold: 10, // 降低阈值，提高移动端响应性
      pointer: { touch: true }, // 明确启用触摸支持
    },
  )

  // 渲染下拉指示器
  const renderPullIndicator = () => {
    if (!isPulling && !loadingMore && !showNoMoreData) return null

    // 无更多数据提示
    if (showNoMoreData) {
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {noMoreDataText || t('app.chat.noMoreHistory') || '已加载全部会话'}
          </span>
          <span className="mt-1 text-xs text-gray-500">
            {t('app.chat.allHistoryLoaded') || '所有历史消息已加载完毕'}
          </span>
        </div>
      )
    }

    // 加载中状态
    if (loadingMore) {
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <Loading type="area" />
          <span className="mt-3 text-sm font-medium text-blue-600">
            {t('app.chat.loadingMoreHistory') || '正在加载更多历史消息...'}
          </span>
        </div>
      )
    }

    // 可释放状态
    if (canRelease) {
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          <span className="mt-3 text-sm font-medium text-green-600">
            {hasMoreData
              ? (t('app.chat.releaseToLoadMore') || '释放加载更多历史消息')
              : (noMoreDataText || t('app.chat.noMoreHistory') || '已加载全部会话')
            }
          </span>
        </div>
      )
    }

    // 拖拽中状态
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="mt-3 text-sm font-medium text-gray-600">
          {hasMoreData
            ? (t('app.chat.pullToLoadMore') || '下拉加载更多历史消息')
            : (noMoreDataText || t('app.chat.noMoreHistory') || '已加载全部会话')
          }
        </span>
      </div>
    )
  }

  return (
    <animated.div
      ref={containerRef}
      {...bind()}
      style={{ y }}
      className={cn('page-pull-to-refresh min-h-screen', className)}
      // 确保移动端触摸事件正常工作
      onTouchStart={(e) => {
        // 额外的移动端处理
        if (window.pageYOffset === 0)
          e.preventDefault()
      }}
    >
      {/* 下拉指示器 - 固定在顶部 */}
      <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-sm">
        {renderPullIndicator()}
      </div>

      {/* 页面内容 */}
      <div className="relative">
        {children}
      </div>
    </animated.div>
  )
}

export default PagePullToRefresh
