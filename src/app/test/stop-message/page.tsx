'use client'

import React, { useCallback, useRef, useState } from 'react'
import { sendChatMessage, stopChatMessage } from '@/services'
import Toast from '@/app/components/base/toast'
import ApiMonitor from './components/api-monitor'

type MessageState = {
  content: string
  timestamp: string
  type: 'user' | 'assistant' | 'system'
}

type TestState = {
  isLoading: boolean
  isResponding: boolean
  taskId: string | null
  conversationId: string
  error: string | null
  messages: MessageState[]
}

export default function StopMessageTestPage() {
  // 表单状态
  const [conversationId, setConversationId] = useState('')
  const [messageContent, setMessageContent] = useState('')

  // 测试状态
  const [testState, setTestState] = useState<TestState>({
    isLoading: false,
    isResponding: false,
    taskId: null,
    conversationId: '',
    error: null,
    messages: [],
  })

  // 用于存储当前响应内容
  const currentResponseRef = useRef('')
  const abortControllerRef = useRef<AbortController | null>(null)

  // 添加消息到列表
  const addMessage = useCallback((content: string, type: 'user' | 'assistant' | 'system') => {
    const newMessage: MessageState = {
      content,
      timestamp: new Date().toLocaleTimeString(),
      type,
    }

    setTestState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }))
  }, [])

  // 更新最后一条助手消息
  const updateLastAssistantMessage = useCallback((content: string) => {
    setTestState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, index) =>
        index === prev.messages.length - 1 && msg.type === 'assistant'
          ? { ...msg, content }
          : msg,
      ),
    }))
  }, [])

  // 发送消息
  const handleSendMessage = useCallback(async () => {
    if (!conversationId.trim() || !messageContent.trim()) {
      Toast.notify({ type: 'error', message: '请填写会话ID和消息内容' })
      return
    }

    if (testState.isResponding) {
      Toast.notify({ type: 'warning', message: '正在发送消息中，请先停止当前消息' })
      return
    }

    // 重置状态
    setTestState(prev => ({
      ...prev,
      isLoading: true,
      isResponding: false,
      taskId: null,
      error: null,
      conversationId,
    }))

    currentResponseRef.current = ''

    // 添加用户消息
    addMessage(messageContent, 'user')

    // 添加空的助手消息占位符
    addMessage('', 'assistant')

    const requestData = {
      inputs: {},
      query: messageContent,
      conversation_id: conversationId === 'new' ? null : conversationId,
      response_mode: 'streaming',
    }

    try {
      await sendChatMessage(requestData, {
        getAbortController: (controller) => {
          abortControllerRef.current = controller
        },
        onData: (data: string, isFirstMessage: boolean, moreInfo: any) => {
          console.log('📥 收到数据:', { data, isFirstMessage, moreInfo })

          // 设置 taskId
          if (moreInfo.taskId && !testState.taskId) {
            setTestState(prev => ({
              ...prev,
              taskId: moreInfo.taskId,
              isResponding: true,
              isLoading: false,
            }))
          }

          // 更新响应内容
          currentResponseRef.current += data
          updateLastAssistantMessage(currentResponseRef.current)
        },
        onCompleted: (hasError?: boolean) => {
          console.log('✅ 消息发送完成:', { hasError })
          setTestState(prev => ({
            ...prev,
            isResponding: false,
            isLoading: false,
            taskId: null,
          }))

          if (!hasError)
            addMessage('✅ 消息发送完成', 'system')
        },
        onError: (error: any) => {
          console.error('❌ 发送消息失败:', error)
          setTestState(prev => ({
            ...prev,
            isResponding: false,
            isLoading: false,
            error: error?.message || '发送消息失败',
            taskId: null,
          }))
          addMessage(`❌ 发送失败: ${error?.message || '未知错误'}`, 'system')
        },
        onThought: (thought: any) => {
          console.log('💭 思考过程:', thought)
        },
        onFile: (file: any) => {
          console.log('📎 文件:', file)
        },
        onMessageEnd: (messageEnd: any) => {
          console.log('🏁 消息结束:', messageEnd)
        },
        onMessageReplace: (messageReplace: any) => {
          console.log('🔄 消息替换:', messageReplace)
        },
        onWorkflowStarted: (workflow: any) => {
          console.log('🚀 工作流开始:', workflow)
        },
        onWorkflowFinished: (workflow: any) => {
          console.log('🏆 工作流完成:', workflow)
        },
        onNodeStarted: (node: any) => {
          console.log('🔵 节点开始:', node)
        },
        onNodeFinished: (node: any) => {
          console.log('🟢 节点完成:', node)
        },
      })
    }
 catch (error: any) {
      console.error('发送消息异常:', error)
      setTestState(prev => ({
        ...prev,
        isResponding: false,
        isLoading: false,
        error: error?.message || '发送消息异常',
      }))
      addMessage(`❌ 发送异常: ${error?.message || '未知错误'}`, 'system')
    }
  }, [conversationId, messageContent, testState.isResponding, testState.taskId, addMessage, updateLastAssistantMessage])

  // 停止消息
  const handleStopMessage = useCallback(async () => {
    if (!testState.taskId) {
      Toast.notify({ type: 'error', message: '没有正在进行的任务可以停止' })
      return
    }

    if (!testState.isResponding) {
      Toast.notify({ type: 'warning', message: '当前没有正在响应的消息' })
      return
    }

    addMessage(`🛑 正在停止任务: ${testState.taskId}`, 'system')

    try {
      console.log('🛑 调用停止API, taskId:', testState.taskId)
      const result = await stopChatMessage(testState.taskId)
      console.log('🛑 停止API响应:', result)

      setTestState(prev => ({
        ...prev,
        isResponding: false,
        taskId: null,
      }))

      addMessage('✅ 消息已成功停止', 'system')
      Toast.notify({ type: 'success', message: '消息已成功停止' })
    }
 catch (error: any) {
      console.error('❌ 停止消息失败:', error)
      setTestState(prev => ({
        ...prev,
        error: error?.message || '停止消息失败',
      }))
      addMessage(`❌ 停止失败: ${error?.message || '未知错误'}`, 'system')
      Toast.notify({ type: 'error', message: error?.message || '停止消息失败' })
    }
  }, [testState.taskId, testState.isResponding, addMessage])

  // 清空消息历史
  const handleClearMessages = useCallback(() => {
    setTestState(prev => ({
      ...prev,
      messages: [],
      error: null,
    }))
    currentResponseRef.current = ''
  }, [])

  return (
    <div className="prose min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            停止聊天消息 API 测试页面
          </h1>
          <p className="text-gray-600">
            测试 <code className="rounded bg-gray-200 px-2 py-1">POST /api/chat-messages/[taskId]/stop</code> API 端点
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* 左侧：控制面板 */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">测试控制面板</h2>

            {/* 输入表单 */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  会话ID
                </label>
                <input
                  type="text"
                  value={conversationId}
                  onChange={e => setConversationId(e.target.value)}
                  placeholder="输入会话ID，或输入 'new' 创建新会话"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  消息内容
                </label>
                <textarea
                  value={messageContent}
                  onChange={e => setMessageContent(e.target.value)}
                  placeholder="输入要发送的消息内容..."
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSendMessage}
                  disabled={testState.isLoading || testState.isResponding}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {testState.isLoading ? '发送中...' : '发送消息'}
                </button>

                <button
                  onClick={handleStopMessage}
                  disabled={!testState.isResponding || !testState.taskId}
                  className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  停止消息
                </button>
              </div>

              <button
                onClick={handleClearMessages}
                className="w-full rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                清空消息历史
              </button>
            </div>

            {/* 状态显示 */}
            <div className="mt-6 rounded-md bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">当前状态</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">会话ID:</span>
                  <span className="ml-2 text-gray-600">{testState.conversationId || '未设置'}</span>
                </div>
                <div>
                  <span className="font-medium">任务ID:</span>
                  <span className="ml-2 text-gray-600">{testState.taskId || '无'}</span>
                </div>
                <div>
                  <span className="font-medium">响应状态:</span>
                  <span className={`ml-2 ${testState.isResponding ? 'text-green-600' : 'text-gray-600'}`}>
                    {testState.isResponding ? '正在响应' : '空闲'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">加载状态:</span>
                  <span className={`ml-2 ${testState.isLoading ? 'text-blue-600' : 'text-gray-600'}`}>
                    {testState.isLoading ? '加载中' : '空闲'}
                  </span>
                </div>
              </div>
            </div>

            {/* 错误显示 */}
            {testState.error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
                <h3 className="mb-1 text-sm font-medium text-red-800">错误信息</h3>
                <p className="text-sm text-red-600">{testState.error}</p>
              </div>
            )}
          </div>

          {/* 中间：消息历史 */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">消息历史</h2>

            <div className="max-h-96 space-y-3 overflow-y-auto">
              {testState.messages.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  暂无消息，请发送一条消息开始测试
                </div>
              ) : (
                testState.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-md p-3 ${
                      message.type === 'user'
                        ? 'border-l-4 border-blue-400 bg-blue-50'
                        : message.type === 'assistant'
                        ? 'border-l-4 border-green-400 bg-green-50'
                        : 'border-l-4 border-yellow-400 bg-yellow-50'
                    }`}
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <span className={`text-xs font-medium ${
                        message.type === 'user'
                          ? 'text-blue-600'
                          : message.type === 'assistant'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}>
                        {message.type === 'user' ? '👤 用户' : message.type === 'assistant' ? '🤖 助手' : '⚙️ 系统'}
                      </span>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-gray-800">
                      {message.content || (message.type === 'assistant' && testState.isResponding ? '正在输入...' : '')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 右侧：API 监控 */}
          <div>
            <ApiMonitor />
          </div>
        </div>

        {/* API 调用详情 */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">API 调用详情</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 发送消息 API */}
            <div className="rounded-md bg-blue-50 p-4">
              <h3 className="mb-2 font-medium text-blue-800">发送消息 API</h3>
              <div className="space-y-1 text-sm">
                <div><strong>端点:</strong> <code>POST /api/chat-messages</code></div>
                <div><strong>请求体:</strong></div>
                <pre className="overflow-x-auto rounded bg-white p-2 text-xs">
{JSON.stringify({
  inputs: {},
  query: '消息内容',
  conversation_id: '会话ID或null',
  response_mode: 'streaming',
}, null, 2)}
                </pre>
                <div><strong>响应:</strong> Server-Sent Events 流</div>
              </div>
            </div>

            {/* 停止消息 API */}
            <div className="rounded-md bg-red-50 p-4">
              <h3 className="mb-2 font-medium text-red-800">停止消息 API</h3>
              <div className="space-y-1 text-sm">
                <div><strong>端点:</strong> <code>POST /api/chat-messages/[taskId]/stop</code></div>
                <div><strong>taskId:</strong> {testState.taskId || '未获取'}</div>
                <div><strong>请求体:</strong></div>
                <pre className="rounded bg-white p-2 text-xs">
{JSON.stringify({ user: 'abc-123' }, null, 2)}
                </pre>
                <div><strong>状态:</strong>
                  <span className={`ml-1 ${testState.taskId ? 'text-green-600' : 'text-gray-500'}`}>
                    {testState.taskId ? '可调用' : '等待 taskId'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">使用说明</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="mr-2 font-medium text-blue-600">1.</span>
              <span>在"会话ID"输入框中输入一个有效的会话ID，或输入 "new" 创建新会话</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2 font-medium text-blue-600">2.</span>
              <span>在"消息内容"输入框中输入要发送的测试消息（建议使用较长的消息以便有时间测试停止功能）</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2 font-medium text-blue-600">3.</span>
              <span>点击"发送消息"按钮开始发送消息，系统会自动获取 taskId</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2 font-medium text-blue-600">4.</span>
              <span>在消息响应过程中，点击"停止消息"按钮测试停止API</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2 font-medium text-blue-600">5.</span>
              <span>观察右侧消息历史、控制台日志和API调用详情，查看测试结果</span>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              <strong>测试建议：</strong> 使用较长的问题（如"请详细解释人工智能的发展历史"）来确保有足够时间测试停止功能。
            </p>
          </div>

          <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>调试提示：</strong> 打开浏览器开发者工具的控制台和网络面板，可以看到详细的API调用信息。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
