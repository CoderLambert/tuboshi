'use client'
import { useCallback, useRef, useState } from 'react'
import { fetchChatList } from '@/services'

export default function HistoryLoadingTestPage() {
  const [conversationId, setConversationId] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const firstIdRef = useRef<string | null>(null)

  // 初始加载消息
  const loadInitialMessages = useCallback(async () => {
    if (!conversationId.trim()) {
      setError('请输入会话ID')
      return
    }

    setLoading(true)
    setError(null)
    setMessages([])
    firstIdRef.current = null

    try {
      const res = await fetchChatList(conversationId, null, 5)
      const { data, has_more } = res

      setMessages(data || [])
      setHasMore(has_more)

      // 设置第一条消息的ID用于后续分页
      if (data && data.length > 0)
        firstIdRef.current = data[0].id

      console.log('初始加载结果:', { data, has_more, firstId: firstIdRef.current })
    }
 catch (err) {
      console.error('加载失败:', err)
      setError(err instanceof Error ? err.message : '加载失败')
    }
 finally {
      setLoading(false)
    }
  }, [conversationId])

  // 加载历史消息
  const loadHistoryMessages = useCallback(async () => {
    if (!conversationId.trim() || !firstIdRef.current || !hasMore)
      return

    setLoading(true)
    setError(null)

    try {
      const res = await fetchChatList(conversationId, firstIdRef.current, 5)
      const { data, has_more } = res

      if (data && data.length > 0) {
        // 将历史消息插入到开头
        setMessages(prev => [...data, ...prev])
        setHasMore(has_more)

        // 更新第一条消息ID
        firstIdRef.current = data[0].id

        console.log('历史消息加载结果:', { data, has_more, newFirstId: firstIdRef.current })
      }
 else {
        setHasMore(false)
      }
    }
 catch (err) {
      console.error('加载历史消息失败:', err)
      setError(err instanceof Error ? err.message : '加载历史消息失败')
    }
 finally {
      setLoading(false)
    }
  }, [conversationId, hasMore])

  return (
    <div className="prose min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">历史消息加载测试</h1>

        {/* 控制面板 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              会话ID
            </label>
            <input
              type="text"
              value={conversationId}
              onChange={e => setConversationId(e.target.value)}
              placeholder="输入会话ID"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={loadInitialMessages}
              disabled={loading || !conversationId.trim()}
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载最近消息'}
            </button>

            <button
              onClick={loadHistoryMessages}
              disabled={loading || !hasMore || messages.length === 0}
              className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载历史消息'}
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
            <h3 className="text-sm font-medium text-gray-500">是否有更多</h3>
            <p className={`text-2xl font-bold ${hasMore ? 'text-green-600' : 'text-red-600'}`}>
              {hasMore ? '是' : '否'}
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">当前first_id</h3>
            <p className="break-all font-mono text-sm text-gray-600">
              {firstIdRef.current || '无'}
            </p>
          </div>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 消息列表 */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold">消息列表</h2>
            <p className="text-sm text-gray-600">
              按时间倒序显示，最新消息在下方
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                暂无消息，请先加载消息
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={msg.id} className="border-b border-gray-100 p-4 last:border-b-0">
                  <div className="mb-2 flex items-start justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      消息 #{index + 1}
                    </span>
                    <span className="font-mono text-xs text-gray-500">
                      ID: {msg.id}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded bg-blue-50 p-3">
                      <div className="mb-1 text-xs text-blue-600">用户问题:</div>
                      <div className="text-sm">{msg.query}</div>
                    </div>

                    <div className="rounded bg-green-50 p-3">
                      <div className="mb-1 text-xs text-green-600">AI回答:</div>
                      <div className="text-sm">{msg.answer}</div>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    创建时间: {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-900">使用说明</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>1. 输入一个有效的会话ID</li>
            <li>2. 点击"加载最近消息"获取最新的5条消息</li>
            <li>3. 点击"加载历史消息"获取更早的消息</li>
            <li>4. 观察first_id的变化和has_more状态</li>
            <li>5. 历史消息会插入到列表开头，保持时间顺序</li>
          </ul>
        </div>

        {/* API信息 */}
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold text-gray-900">API调用信息</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>初始加载:</strong> fetchChatList(conversationId, null, 5)</p>
            <p><strong>历史加载:</strong> fetchChatList(conversationId, firstId, 5)</p>
            <p><strong>返回格式:</strong> {'{ data: [], has_more: boolean, limit: number }'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
