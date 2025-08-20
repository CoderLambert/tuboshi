'use client'
import { useCallback, useRef, useState } from 'react'

export default function ScrollBehaviorTestPage() {
  const [messages, setMessages] = useState<string[]>([
    '这是第一条消息',
    '这是第二条消息',
    '这是第三条消息',
  ])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showLoadButton, setShowLoadButton] = useState(true)
  const isLoadingHistoryRef = useRef(false)

  // 模拟加载历史消息
  const loadHistoryMessages = useCallback(() => {
    if (isLoadingHistory) return

    setIsLoadingHistory(true)
    isLoadingHistoryRef.current = true

    // 模拟网络请求
    setTimeout(() => {
      const historyMessages = [
        `历史消息 ${Date.now() - 3000}`,
        `历史消息 ${Date.now() - 2000}`,
        `历史消息 ${Date.now() - 1000}`,
      ]

      // 将历史消息插入到开头
      setMessages(prev => [...historyMessages, ...prev])

      setIsLoadingHistory(false)
      isLoadingHistoryRef.current = false

      // 模拟没有更多历史消息
      if (messages.length > 10)
        setShowLoadButton(false)
    }, 1000)
  }, [isLoadingHistory, messages.length])

  // 添加新消息（模拟正常聊天）
  const addNewMessage = useCallback(() => {
    const newMessage = `新消息 ${Date.now()}`
    setMessages(prev => [...prev, newMessage])
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">滚动行为测试</h1>

        {/* 控制面板 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <div className="flex gap-4">
            <button
              onClick={loadHistoryMessages}
              disabled={isLoadingHistory || !showLoadButton}
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingHistory ? '加载历史消息中...' : '加载历史消息'}
            </button>

            <button
              onClick={addNewMessage}
              className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              添加新消息
            </button>

            <button
              onClick={() => setMessages([])}
              className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              清空消息
            </button>
          </div>
        </div>

        {/* 状态信息 */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">消息数量</h3>
            <p className="text-2xl font-bold text-blue-600">{messages.length}</p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">加载状态</h3>
            <p className={`text-2xl font-bold ${isLoadingHistory ? 'text-orange-600' : 'text-green-600'}`}>
              {isLoadingHistory ? '加载中' : '空闲'}
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">isLoadingHistoryRef</h3>
            <p className={`text-2xl font-bold ${isLoadingHistoryRef.current ? 'text-red-600' : 'text-green-600'}`}>
              {isLoadingHistoryRef.current ? 'true' : 'false'}
            </p>
          </div>
        </div>

        {/* 测试说明 */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-900">测试说明</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✅ <strong>加载历史消息</strong>: 点击按钮加载历史消息，页面不应该自动滚动到底部</li>
            <li>✅ <strong>添加新消息</strong>: 点击按钮添加新消息，页面应该自动滚动到底部</li>
            <li>✅ <strong>状态监控</strong>: 观察isLoadingHistoryRef的状态变化</li>
            <li>✅ <strong>滚动行为</strong>: 验证不同操作下的滚动行为是否正确</li>
          </ul>
        </div>

        {/* 消息列表 */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold">消息列表</h2>
            <p className="text-sm text-gray-600">
              历史消息在上方，新消息在下方
            </p>
          </div>

          {/* 历史消息加载按钮 */}
          {showLoadButton && (
            <div className="sticky top-0 z-10 flex justify-center bg-gradient-to-b from-white to-transparent py-2">
              <button
                onClick={loadHistoryMessages}
                disabled={isLoadingHistory}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  isLoadingHistory
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                    : 'border-gray-300 bg-white text-gray-700 shadow-sm hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {isLoadingHistory ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    <span>加载中...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span>查看历史消息</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                暂无消息
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="mb-3 rounded-lg bg-gray-50 p-3">
                  <div className="mb-1 text-sm text-gray-600">
                    消息 #{index + 1}
                  </div>
                  <div className="text-gray-900">{msg}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 预期行为说明 */}
        <div className="mt-8 rounded-lg bg-green-50 p-4">
          <h3 className="mb-2 font-semibold text-green-900">预期行为</h3>
          <div className="space-y-2 text-sm text-green-800">
            <p><strong>加载历史消息时:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• isLoadingHistoryRef.current 设置为 true</li>
              <li>• 历史消息插入到列表开头</li>
              <li>• 页面不自动滚动到底部</li>
              <li>• 用户保持当前滚动位置</li>
            </ul>

            <p><strong>添加新消息时:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• isLoadingHistoryRef.current 为 false</li>
              <li>• 新消息添加到列表末尾</li>
              <li>• 页面自动滚动到底部</li>
              <li>• 显示最新消息</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
