'use client'
import type { ReactNode } from 'react'
import { useNativeBridge } from '@/hooks/useNativeBridge'

type SafeAreaLayoutProps = {
  title?: string
  onBack?: () => void
  children: ReactNode
  headerHeight?: number // 头部高度，默认 88（你的设计值）
}

export default function SafeAreaLayout({
  title = '',
  onBack,
  children,
  headerHeight = 44,
}: SafeAreaLayoutProps) {
  const { closeWebview, useStatusBarHeight } = useNativeBridge()
//   const { top } = useStatusBarHeight()
  const top = 40
  return (
    <div className="relative h-full w-full bg-white">
      {/* 顶部安全区 + Header */}
      <div
        className="fixed left-0 right-0 top-0 z-[999] flex flex-col border-b border-[#E5E5E5] bg-white"
        style={{ paddingTop: `calc(${top} * var(--tpx))` }}
      >
        <div
          className="relative flex items-center"
          style={{ height: `calc(${headerHeight} * var(--tpx))` }}
        >
          {onBack && (
             <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="black"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-black"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>

            // <button
            //   onClick={onBack || closeWebview}
            //   className="absolute left-[24px] top-1/2 -translate-y-1/2"
            // >
            //   {/* 内联 SVG 图标，替换成你 SVG 文件里的内容 */}
            //   <svg
            //     xmlns="http://www.w3.org/2000/svg"
            //     width="24"
            //     height="24"
            //     viewBox="0 0 24 24"
            //     fill="none"
            //     stroke="currentColor"
            //     strokeWidth="2"
            //     strokeLinecap="round"
            //     strokeLinejoin="round"
            //     className="h-6 w-6 text-black"
            //   >
            //     <line x1="18" y1="6" x2="6" y2="18" />
            //     <line x1="6" y1="6" x2="18" y2="18" />
            //   </svg>
            // </button>
          )}
          <div className="flex-1 text-center text-[34px] font-bold">{title}</div>
        </div>
      </div>

      {/* 内容区，自动下移 */}
      <div
        className="relative"
        style={{ marginTop: `calc((${top} + ${headerHeight}) * var(--tpx))` }}
      >
        {children}
      </div>
    </div>
  )
}
