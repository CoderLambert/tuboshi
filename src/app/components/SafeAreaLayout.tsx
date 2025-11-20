'use client'
import type { ReactNode } from 'react'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { ChevronLeft, Clock, MessageSquarePlus } from 'lucide-react'
import { useSending } from '@/app/contexts/SendingContext'

type SafeAreaLayoutProps = {
  title?: string
  children: ReactNode
  headerHeight?: number // 头部高度，默认 44（你的设计值）
  showMenu?: boolean // 是否显示菜单栏
  onNewConversation?: () => void // 新建会话回调
  onShowHistory?: () => void // 显示历史记录回调
}

export default function SafeAreaLayout({
  title = '',
  children,
  headerHeight = 44,
  showMenu = true,
  onNewConversation,
  onShowHistory,
}: SafeAreaLayoutProps) {
  const { closeWebview, useStatusBarHeight } = useNativeBridge()
  const { top } = useStatusBarHeight()
  const { isSendingMessage } = useSending()
  // const top = 40
  return (
    <div className="relative h-full w-full" >
      {/* 顶部安全区 + Header */}
      <div
        className="fixed left-0 right-0 top-0 z-[999] flex flex-col"
        style={{
          paddingTop: `calc(${top} * var(--tpx))`,
          background: 'linear-gradient(244deg, rgba(255, 232, 224, 1) 0%, rgb(247 233 241 / 58%) 50%, rgba(250, 231, 217, 1) 100%)',
        }}
      >
        <div
          className="relative flex items-center justify-between px-4"
          style={{ height: `calc(${headerHeight} * var(--tpx))` }}
        >
          {/* 左侧返回按钮 */}
          <ChevronLeft
            className='h-6 w-6 font-bold text-gray-700 transition-colors active:text-gray-900'
            onClick={closeWebview}
          />

          {/* 中间标题区域 */}
          <div className="flex-1 text-center text-[34px] font-bold">{title}</div>

          {/* 右侧菜单按钮区域 */}
          {showMenu && (
            <div className="flex items-center gap-2">
              {/* 新建会话按钮 */}
              <button
                onClick={onNewConversation}
                disabled={isSendingMessage}
                className={`flex h-8 w-8 items-center justify-center transition-transform active:scale-90 ${
                  isSendingMessage ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <MessageSquarePlus className="h-5 w-5 text-gray-700 transition-colors hover:text-gray-900" />
              </button>

              {/* 历史记录按钮 */}
              <button
                onClick={onShowHistory}
                disabled={isSendingMessage}
                className={`flex h-8 w-8 items-center justify-center transition-transform active:scale-90 ${
                  isSendingMessage ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <Clock className="h-5 w-5 text-gray-700 transition-colors hover:text-gray-900" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 内容区，自动下移 */}
      <div
        className="relative pt-4"
        style={{ paddingTop: `calc((${top} + ${headerHeight}) * var(--tpx))` }}
      >
        {children}
      </div>
    </div>
  )
}
