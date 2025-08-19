'use client'

import { useCallback, useRef, useState } from 'react'

export default function ScrollTestPage() {
  const [messages, setMessages] = useState<string[]>([
    '这是第一条消息',
    '这是第二条消息',
    '这是第三条消息',
  ])

  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false)

  const scrollToBottom = useCallback(() => {
    const element = scrollRef.current
    if (!element) return

    setIsScrolling(true)
    element.scrollTop = element.scrollHeight - element.clientHeight

    setTimeout(() => {
      setIsScrolling(false)
    }, 100)
  }, [])

  const enableAutoScroll = useCallback(() => {
    setIsAutoScrollEnabled(true)
    scrollToBottom()
  }, [scrollToBottom])

  const disableAutoScroll = useCallback(() => {
    setIsAutoScrollEnabled(false)
  }, [])

  const addMessage = () => {
    const newMessage = `新消息 ${messages.length + 1} - ${new Date().toLocaleTimeString()}`
    setMessages(prev => [...prev, newMessage])
  }

  const addMultipleMessages = () => {
    const newMessages = Array.from({ length: 5 }, (_, i) =>
      `批量消息 ${messages.length + i + 1} - ${new Date().toLocaleTimeString()}`,
    )
    setMessages(prev => [...prev, ...newMessages])
  }

  return (
    <div className="flex h-screen flex-col p-4">
      <h1 className="mb-4 text-2xl font-bold">智能滚动测试页面</h1>

      <div className="mb-4 flex gap-2">
        <button
          onClick={addMessage}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          添加消息
        </button>
        <button
          onClick={addMultipleMessages}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          添加5条消息
        </button>
        <button
          onClick={scrollToBottom}
          className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
        >
          手动滚动到底部
        </button>
        <button
          onClick={enableAutoScroll}
          className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
        >
          启用自动滚动
        </button>
        <button
          onClick={disableAutoScroll}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          禁用自动滚动
        </button>
      </div>

      <div className="mb-4 flex gap-4 text-sm">
        <div className={`rounded px-2 py-1 ${isAutoScrollEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          自动滚动: {isAutoScrollEnabled ? '启用' : '禁用'}
        </div>
        <div className={`rounded px-2 py-1 ${isScrolling ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
          滚动状态: {isScrolling ? '滚动中' : '静止'}
        </div>
      </div>

      <div className="relative flex-1 border border-gray-300">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto p-4"
          style={{ maxHeight: '400px' }}
        >
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className="rounded bg-gray-100 p-3 shadow-sm"
              >
                <div className="text-sm text-gray-600">消息 #{index + 1}</div>
                <div>{message}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 滚动到底部按钮 */}
        {!isAutoScrollEnabled && (
          <button
            onClick={enableAutoScroll}
            className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-xl"
            title="滚动到底部"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-semibold">测试说明：</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>点击"添加消息"或"添加5条消息"来模拟新消息</li>
          <li>当自动滚动启用时，新消息会自动滚动到底部</li>
          <li>手动向上滚动会禁用自动滚动，并显示滚动到底部按钮</li>
          <li>滚动回到底部或点击按钮会重新启用自动滚动</li>
          <li>观察状态指示器的变化</li>
        </ul>
      </div>
    </div>
  )
}
