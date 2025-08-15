'use client'

import { useEffect, useRef } from 'react'

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (document.activeElement === textareaRef.current)
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-full w-full flex-col px-[32px]">
      <div className="suggestions text-[38px] font-[500] leading-[48px] text-[#262222]">我是MAOMAO，你的智能助手</div>
      <footer className="bg-chat-input-mask absolute bottom-0 flex max-h-[158px] w-full justify-center overflow-auto pb-4">
        <textarea
          ref={textareaRef}
          className="w-[452px]"
          placeholder="请输入"
          onFocus={() => {
              textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }}
        />
      </footer>
    </div>
  )
}
