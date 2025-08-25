'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import cn from 'clsx'
import { debounce } from 'lodash-es' // 引入 lodash 或自行实现防抖

export type IMobilePullToRefreshProps = {
  children: React.ReactNode;
  onLoadMore?: () => Promise<void>;
  loadingMore?: boolean;
  hasMoreData?: boolean;
  noMoreDataText?: string;
  className?: string;
}

const MobilePullToRefresh: React.FC<IMobilePullToRefreshProps> = ({
  children,
  onLoadMore,
  loadingMore = false,
  hasMoreData = true,
  noMoreDataText,
  className,
}) => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [showNoMoreData, setShowNoMoreData] = useState(false)
  const [startY, setStartY] = useState(0)
  const [isTracking, setIsTracking] = useState(false)

  let supportsPassive = false
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        supportsPassive = true
        return true
      },
    })
    window.addEventListener('testPassive', () => {}, opts)
    window.removeEventListener('testPassive', () => {}, opts)
  }
  catch (e) {}

  const handleLoadMore = useCallback(
    debounce(async () => {
      console.log('🔄 handleLoadMore called - loadingMore:', loadingMore, 'hasMoreData:', hasMoreData)
      if (!hasMoreData) {
        console.log('❌ No more data available')
        setShowNoMoreData(true)
        setTimeout(() => {
          setShowNoMoreData(false)
          setIsPulling(false)
          setPullDistance(0)
        }, 2000)
        return
      }

      if (onLoadMore && !loadingMore) {
        console.log('✅ Starting load more...')
        try {
          await onLoadMore()
          console.log('✅ Load more completed')
        }
 finally {
          setIsPulling(false)
          setPullDistance(0)
        }
      }
 else {
        console.log('⚠️ Load more skipped - already loading or no handler')
      }
    }, 500),
    [onLoadMore, loadingMore, hasMoreData],
  )

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (loadingMore) return
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      if (scrollTop > 0) return

      const touch = e.touches[0]
      setStartY(touch.clientY)
      setIsTracking(true)

        if (!supportsPassive) {
        // ✅ 只在不支持 passive 时才调用 preventDefault
        e.preventDefault()
  }
    },
    [loadingMore],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isTracking || loadingMore) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      if (scrollTop > 0) {
        setIsTracking(false)
        setIsPulling(false)
        setPullDistance(0)
        return
      }

      const touch = e.touches[0]
      const deltaY = touch.clientY - startY

      if (deltaY > 0) {
        e.preventDefault()
        e.stopPropagation()

        const distance = Math.min(deltaY * 0.5, 80)
        setPullDistance(distance)
        setIsPulling(distance > 10)
      }
 else {
        setIsPulling(false)
        setPullDistance(0)
      }
    },
    [isTracking, startY, loadingMore],
  )

  const handleTouchEnd = useCallback(() => {
    if (!isTracking || loadingMore) return

    setIsTracking(false)

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    if (scrollTop > 0) {
      setIsPulling(false)
      setPullDistance(0)
      return
    }

    if (pullDistance >= 80 && hasMoreData) {
      handleLoadMore()
    }
 else if (pullDistance >= 80 && !hasMoreData) {
      setShowNoMoreData(true)
      setTimeout(() => {
        setShowNoMoreData(false)
        setIsPulling(false)
        setPullDistance(0)
      }, 2000)
    }
 else {
      setIsPulling(false)
      setPullDistance(0)
    }
  }, [isTracking, pullDistance, hasMoreData, handleLoadMore, loadingMore])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const style = document.createElement('style')
    style.textContent = `
      body {
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
      }
      .mobile-pull-to-refresh {
        overscroll-behavior-y: none;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y pinch-zoom;
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      .mobile-pull-to-refresh * {
        pointer-events: auto;
        touch-action: inherit;
      }
    `
    document.head.appendChild(style)

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      if (document.head.contains(style))
        document.head.removeChild(style)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const renderPullIndicator = () => {
    if (!isPulling && !loadingMore && !showNoMoreData) return null

    if (showNoMoreData) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-600">
            {noMoreDataText || t('app.chat.noMoreHistory') || '已加载全部会话'}
          </span>
        </div>
      )
    }

    if (loadingMore) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="mb-2 h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
          <span className="text-xs font-medium text-blue-600">
            {t('app.chat.loadingMoreHistory') || '正在加载...'}
          </span>
        </div>
      )
    }

    const canRelease = pullDistance >= 80
    const progress = Math.min(pullDistance / 80, 1)

    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="relative mb-2">
          <div className="h-6 w-6 rounded-full border-2 border-gray-200"></div>
          <div
            className={cn(
              'absolute inset-0 h-6 w-6 rounded-full border-2 border-t-transparent transition-all duration-200',
              canRelease ? 'animate-spin border-green-500' : 'border-blue-500',
            )}
            style={{
              transform: `rotate(${progress * 360}deg)`,
              opacity: 0.3 + progress * 0.7,
            }}
          ></div>
          {canRelease && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            </div>
          )}
        </div>
        <span
          className={cn(
            'text-xs font-medium transition-colors duration-200',
            canRelease ? 'text-green-600' : 'text-gray-500',
          )}
        >
          {canRelease
            ? hasMoreData
              ? t('app.chat.releaseToLoadMore')
              : t('app.chat.noMoreMessages')
            : hasMoreData
            ? t('app.chat.pullToLoadMore')
            : t('app.chat.loadHistoryMessages')}
        </span>
      </div>
    )
  }

  return (
    <>
      {(isPulling || loadingMore || showNoMoreData) && (
        <div
          className="fixed left-0 right-0 top-0 z-[9999]"
          style={{
            height: '80px',
            transform: `translateY(${isPulling ? Math.max(-80, pullDistance - 80) : 0}px)`,
            transition: isPulling ? 'none' : 'transform 0.3s ease-out',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
          }}
        >
          {renderPullIndicator()}
        </div>
      )}
      <div
        ref={containerRef}
        className={cn('mobile-pull-to-refresh min-h-screen', className)}
        style={{
          transform: `translateY(${isPulling ? Math.min(pullDistance, 80) : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </>
  )
}

export default MobilePullToRefresh
