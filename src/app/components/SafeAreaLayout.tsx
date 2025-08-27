'use client'
import type { ReactNode } from 'react'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { ChevronLeft } from 'lucide-react'
type SafeAreaLayoutProps = {
  title?: string
  children: ReactNode
  headerHeight?: number // 头部高度，默认 88（你的设计值）
}

export default function SafeAreaLayout({
  title = '',
  children,
  headerHeight = 44,
}: SafeAreaLayoutProps) {
  const { closeWebview, useStatusBarHeight } = useNativeBridge()
  const { top } = useStatusBarHeight()
  // const top = 40
  return (
    <div className="relative h-full w-full" >
      {/* 顶部安全区 + Header */}
      <div
        className="fixed left-0 right-0 top-0 z-[999] flex flex-col"
        style={{ paddingTop: `calc(${top} * var(--tpx))`, background: 'linear-gradient(244deg, rgba(255, 232, 224, 1) 0%, rgb(247 233 241 / 58%) 50%, rgba(250, 231, 217, 1) 100%)' }}
      >
        <div
          className="relative flex items-center"
          style={{ height: `calc(${headerHeight} * var(--tpx))` }}
        >
          <ChevronLeft className='absolute left-2 h-6 w-6 font-bold' onClick={closeWebview} />
          <div className="flex-1 text-center text-[34px] font-bold">{title}</div>
        </div>
      </div>

      {/* 内容区，自动下移 */}
      <div
        className="relative"
        style={{ marginTop: top ? `calc((${top} + ${headerHeight}) * var(--tpx))` : `calc(${headerHeight} * var(--tpx))` }}

      >
        {children}
      </div>
    </div>
  )
}
