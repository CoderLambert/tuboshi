'use client'
import type { ReactNode } from 'react'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { memo, useCallback } from 'react'
import HeaderMenu from './HeaderMenu'
import { ChevronLeft } from 'lucide-react'

type SafeAreaLayoutProps = {
  title?: string
  children: ReactNode
  headerHeight?: number // 头部高度，默认 44（你的设计值）
  showMenu?: boolean // 是否显示菜单栏
  onNewConversation?: () => void // 新建会话回调
  onShowHistory?: () => void // 显示历史记录回调
}

const SafeAreaLayout = memo(({
  title = '',
  children,
  headerHeight = 44,
  showMenu = true,
  onNewConversation,
  onShowHistory,
}: SafeAreaLayoutProps) => {
  const { useStatusBarHeight, closeWebview } = useNativeBridge()
  const { top } = useStatusBarHeight()
  // const top = 40

  // 使用 useCallback 避免函数重新创建，配合 memo 优化
  const handleBackClick = useCallback(() => {
    closeWebview()
  }, [closeWebview])
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden" >
      {/* 顶部安全区 + Header，留在文档流里，避免盖住聊天区 */}
      <div
        className="z-[999] flex shrink-0 flex-col"
        style={{
          paddingTop: `calc(${top || 0} * var(--tpx))`,
          background: 'linear-gradient(244deg, rgba(255, 232, 224, 1) 0%, rgb(247 233 241 / 58%) 50%, rgba(250, 231, 217, 1) 100%)',
        }}
      >
        <div
          className="relative flex min-w-0 items-center justify-between px-4"
          style={{ height: `calc(${headerHeight} * var(--tpx))` }}
        >
          {/* 左侧返回按钮 */}
          <ChevronLeft
            className='h-6 w-6 font-bold text-gray-700 transition-colors active:text-gray-900'
            onClick={handleBackClick}
          />

          {/* 中间标题区域 */}
          <div className="min-w-0 flex-1 truncate text-center text-[34px] font-bold">{title}</div>

          {/* 右侧菜单按钮区域 */}
          {showMenu && (
            <HeaderMenu
              onNewConversation={onNewConversation}
              onShowHistory={onShowHistory}
              showMenu={true}
            />
          )}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-4">
        {children}
      </div>
    </div>
  )
})

SafeAreaLayout.displayName = 'SafeAreaLayout'

export default SafeAreaLayout
