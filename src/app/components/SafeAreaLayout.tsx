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
            onClick={handleBackClick}
          />

          {/* 中间标题区域 */}
          <div className="flex-1 text-center text-[34px] font-bold">{title}</div>

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

      {/* 内容区，自动下移 */}
      <div
        className="relative pt-4"
        style={{ paddingTop: `calc((${top} + ${headerHeight}) * var(--tpx))` }}
      >
        {children}
      </div>
    </div>
  )
})

SafeAreaLayout.displayName = 'SafeAreaLayout'

export default SafeAreaLayout
