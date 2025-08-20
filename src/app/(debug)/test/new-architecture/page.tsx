'use client'
import { useCallback, useState } from 'react'
import Chat from '@/app/components/chat'
import type { ChatItem } from '@/types/app'

export default function NewArchitectureTestPage() {
  // 当前聊天消息（正常聊天逻辑）
  const [chatList, setChatList] = useState<ChatItem[]>([
    {
      id: 'current-1',
      content: '这是当前会话的第一条消息',
      isAnswer: false,
    },
    {
      id: 'current-2',
      content: '这是AI的回复，属于当前会话',
      isAnswer: true,
    },
  ])

  // 历史消息（独立状态）
  const [historyMessages, setHistoryMessages] = useState<ChatItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [hasMoreHistory, setHasMoreHistory] = useState(true)
  const [showLoadHistoryButton, setShowLoadHistoryButton] = useState(true)

  // 模拟加载历史消息
  const loadHistoryMessages = useCallback(() => {
    if (isLoadingHistory || !hasMoreHistory) return

    setIsLoadingHistory(true)

    // 模拟网络请求
    setTimeout(() => {
      const newHistoryMessages: ChatItem[] = [
        {
          id: `history-q-${Date.now()}`,
          content: `历史问题 ${historyMessages.length + 1}`,
          isAnswer: false,
        },
        {
          id: `history-a-${Date.now()}`,
          content: `历史回答 ${historyMessages.length + 1}`,
          isAnswer: true,
        },
      ]

      // 插入到历史消息开头
      setHistoryMessages(prev => [...newHistoryMessages, ...prev])

      // 模拟没有更多历史消息
      if (historyMessages.length >= 6) {
        setHasMoreHistory(false)
        setShowLoadHistoryButton(false)
      }

      setIsLoadingHistory(false)
    }, 1000)
  }, [isLoadingHistory, hasMoreHistory, historyMessages.length])

  // 添加新消息（正常聊天）
  const handleSend = useCallback((message: string) => {
    const newMessage: ChatItem = {
      id: `new-${Date.now()}`,
      content: message,
      isAnswer: false,
    }

    setChatList(prev => [...prev, newMessage])

    // 模拟AI回复
    setTimeout(() => {
      const aiReply: ChatItem = {
        id: `ai-${Date.now()}`,
        content: `AI回复: ${message}`,
        isAnswer: true,
      }
      setChatList(prev => [...prev, aiReply])
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">新架构测试 - 状态分离</h1>

        {/* 状态信息面板 */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">当前消息数</h3>
            <p className="text-2xl font-bold text-blue-600">{chatList.length}</p>
            <p className="text-xs text-gray-400">chatList状态</p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">历史消息数</h3>
            <p className="text-2xl font-bold text-green-600">{historyMessages.length}</p>
            <p className="text-xs text-gray-400">historyMessages状态</p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">加载状态</h3>
            <p className={`text-2xl font-bold ${isLoadingHistory ? 'text-orange-600' : 'text-green-600'}`}>
              {isLoadingHistory ? '加载中' : '空闲'}
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">更多历史</h3>
            <p className={`text-2xl font-bold ${hasMoreHistory ? 'text-green-600' : 'text-red-600'}`}>
              {hasMoreHistory ? '有' : '无'}
            </p>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">控制面板</h2>
          <div className="flex gap-4">
            <button
              onClick={loadHistoryMessages}
              disabled={isLoadingHistory || !hasMoreHistory}
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingHistory ? '加载历史消息中...' : '手动加载历史消息'}
            </button>

            <button
              onClick={() => handleSend(`测试消息 ${Date.now()}`)}
              className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              发送测试消息
            </button>

            <button
              onClick={() => {
                setChatList([])
                setHistoryMessages([])
                setHasMoreHistory(true)
                setShowLoadHistoryButton(true)
              }}
              className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              清空所有消息
            </button>
          </div>
        </div>

        {/* 架构说明 */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-900">新架构特点</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✅ <strong>状态隔离</strong>: historyMessages 与 chatList 完全分离</li>
            <li>✅ <strong>逻辑解耦</strong>: 历史消息不影响当前聊天的自动滚动等逻辑</li>
            <li>✅ <strong>功能简化</strong>: 历史消息只显示，无交互功能</li>
            <li>✅ <strong>渲染分离</strong>: 历史消息区域 + 当前聊天区域分别渲染</li>
            <li>✅ <strong>视觉分隔</strong>: 历史消息有明确的视觉分隔线</li>
          </ul>
        </div>

        {/* Chat组件测试 */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Chat组件 - 新架构</h2>
            <p className="text-sm text-gray-600">
              历史消息和当前消息分别管理，互不影响
            </p>
          </div>

          <div className="h-96">
            <Chat
              chatList={chatList}
              onSend={handleSend}
              isHideSendInput={true}
              showLoadHistoryButton={showLoadHistoryButton}
              isLoadingHistory={isLoadingHistory}
              onLoadHistory={loadHistoryMessages}
              historyMessages={historyMessages}
            />
          </div>
        </div>

        {/* 测试说明 */}
        <div className="mt-8 rounded-lg bg-green-50 p-4">
          <h3 className="mb-2 font-semibold text-green-900">测试验证</h3>
          <div className="space-y-2 text-sm text-green-800">
            <p><strong>状态分离测试:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• 点击"加载历史消息"，观察历史消息数增加，当前消息数不变</li>
              <li>• 点击"发送测试消息"，观察当前消息数增加，历史消息数不变</li>
              <li>• 历史消息和当前消息在UI上有明确分隔</li>
            </ul>

            <p><strong>滚动行为测试:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• 加载历史消息时，页面不会自动滚动到底部</li>
              <li>• 发送新消息时，页面会自动滚动到底部</li>
              <li>• 历史消息加载不影响当前聊天的滚动逻辑</li>
            </ul>

            <p><strong>架构优势:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• 历史消息不会污染当前会话状态</li>
              <li>• 修改历史消息功能不会影响正常聊天逻辑</li>
              <li>• 两个功能模块完全独立，易于维护</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
