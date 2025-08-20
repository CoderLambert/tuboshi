'use client'
import { useCallback, useRef, useState } from 'react'
import OptimizedInput from '@/app/components/chat/optimized-input'

export default function StateSyncTestPage() {
  // 模拟Main组件的状态管理
  const [currentQuery, setCurrentQuery] = useState('')
  const currentQueryRef = useRef('')
  const [messages, setMessages] = useState<string[]>([])

  // 注意：由于输入框现在完全独立，不再需要handleQueryChange

  // 处理发送消息
  const handleSend = useCallback((message: string) => {
    console.log('Send message:', message)
    setMessages(prev => [...prev, message])

    // 发送后清空状态
    setCurrentQuery('')
    currentQueryRef.current = ''
  }, [])

  // 设置预设内容
  const setPresetContent = (content: string) => {
    setCurrentQuery(content)
    currentQueryRef.current = content
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">输入框状态同步测试</h1>

        {/* 状态显示面板 */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-2 text-lg font-semibold">当前状态</h3>
            <div className="space-y-2 text-sm">
              <p><strong>currentQuery:</strong> "{currentQuery}"</p>
              <p><strong>字符数:</strong> {currentQuery.length}</p>
              <p><strong>currentQueryRef:</strong> "{currentQueryRef.current}"</p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-2 text-lg font-semibold">消息历史</h3>
            <div className="max-h-32 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500">暂无消息</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="mb-1 rounded bg-gray-100 p-2 text-sm">
                    {msg}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 预设内容按钮 */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">预设内容测试</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPresetContent('你好，这是一个测试消息')}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
            >
              设置测试消息
            </button>
            <button
              onClick={() => setPresetContent('请帮我写一个Python函数')}
              className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
            >
              设置编程问题
            </button>
            <button
              onClick={() => setPresetContent('')}
              className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
            >
              清空内容
            </button>
          </div>
        </div>

        {/* 输入框组件 */}
        <div className="mb-8">
          <h3 className="mb-3 text-lg font-semibold">OptimizedInput组件（完全独立状态）</h3>
          <OptimizedInput
            onSend={handleSend}
            initialQuery={currentQuery}
          />
          <p className="mt-2 text-sm text-gray-600">
            注意：输入框现在使用完全独立的状态，不会触发外部组件重渲染
          </p>
        </div>

        {/* 测试说明 */}
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-900">测试项目</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✅ <strong>输入同步:</strong> 在输入框中输入文字，观察状态面板是否实时更新</li>
            <li>✅ <strong>预设内容:</strong> 点击预设按钮，观察输入框是否显示对应内容</li>
            <li>✅ <strong>发送清空:</strong> 发送消息后，输入框和状态应该被清空</li>
            <li>✅ <strong>状态一致性:</strong> currentQuery和currentQueryRef应该保持同步</li>
            <li>✅ <strong>消息历史:</strong> 发送的消息应该出现在历史记录中</li>
          </ul>
        </div>

        {/* 性能监控 */}
        <div className="mt-8 rounded-lg bg-yellow-50 p-4">
          <h3 className="mb-2 font-semibold text-yellow-900">性能说明</h3>
          <div className="space-y-1 text-sm text-yellow-800">
            <p>• <strong>本地状态优先:</strong> 输入框使用本地状态，保证即时响应</p>
            <p>• <strong>外部状态同步:</strong> 通过onQueryChange回调同步到父组件</p>
            <p>• <strong>双向绑定:</strong> 支持外部设置initialQuery来更新输入框内容</p>
            <p>• <strong>状态隔离:</strong> 输入状态与消息列表状态完全分离</p>
          </div>
        </div>
      </div>
    </div>
  )
}
