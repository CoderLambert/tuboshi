'use client'

import React, { useEffect, useState } from 'react'

type ApiCall = {
  id: string
  method: string
  url: string
  timestamp: string
  status?: number
  duration?: number
  requestBody?: any
  responseBody?: any
  error?: string
}

type ApiMonitorProps = {
  onApiCall?: (call: ApiCall) => void
}

export default function ApiMonitor({ onApiCall }: ApiMonitorProps) {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  // 监控网络请求
  useEffect(() => {
    if (!isMonitoring) return

    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      const [url, options] = args
      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const startTime = Date.now()

      let requestBody = null
      if (options?.body) {
        try {
          requestBody = typeof options.body === 'string' ? JSON.parse(options.body) : options.body
        }
 catch {
          requestBody = options.body.toString()
        }
      }

      const apiCall: ApiCall = {
        id: callId,
        method: options?.method || 'GET',
        url: url.toString(),
        timestamp: new Date().toLocaleTimeString(),
        requestBody,
      }

      try {
        const response = await originalFetch(...args)
        const endTime = Date.now()

        // 只对特定的API调用记录响应体
        let responseBody = null
        if (url.toString().includes('/api/')) {
          try {
            const responseClone = response.clone()
            const text = await responseClone.text()
            if (text) {
              try {
                responseBody = JSON.parse(text)
              }
 catch {
                responseBody = text.length > 200 ? `${text.substring(0, 200)}...` : text
              }
            }
          }
 catch {
            // 忽略响应体解析错误
          }
        }

        const completedCall = {
          ...apiCall,
          status: response.status,
          duration: endTime - startTime,
          responseBody,
        }

        setApiCalls(prev => [completedCall, ...prev.slice(0, 19)]) // 保留最近20条
        onApiCall?.(completedCall)

        return response
      }
 catch (error: any) {
        const failedCall = {
          ...apiCall,
          error: error.message,
          duration: Date.now() - startTime,
        }

        setApiCalls(prev => [failedCall, ...prev.slice(0, 19)])
        onApiCall?.(failedCall)

        throw error
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [isMonitoring, onApiCall])

  const clearApiCalls = () => {
    setApiCalls([])
  }

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
    if (!isMonitoring)
      setApiCalls([])
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">API 调用监控</h2>
        <div className="flex space-x-2">
          <button
            onClick={toggleMonitoring}
            className={`rounded px-3 py-1 text-sm ${
              isMonitoring
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isMonitoring ? '停止监控' : '开始监控'}
          </button>
          <button
            onClick={clearApiCalls}
            className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
          >
            清空记录
          </button>
        </div>
      </div>

      {!isMonitoring && (
        <div className="py-8 text-center text-gray-500">
          点击"开始监控"按钮开始监控 API 调用
        </div>
      )}

      {isMonitoring && apiCalls.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          监控中... 等待 API 调用
        </div>
      )}

      {apiCalls.length > 0 && (
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {apiCalls.map(call => (
            <div
              key={call.id}
              className={`rounded-md border-l-4 p-3 ${
                call.error
                  ? 'border-red-400 bg-red-50'
                  : call.status && call.status >= 200 && call.status < 300
                  ? 'border-green-400 bg-green-50'
                  : 'border-yellow-400 bg-yellow-50'
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${
                    call.method === 'POST' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {call.method}
                  </span>
                  <span className="text-sm font-medium">{call.url}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{call.timestamp}</span>
                  {call.duration && <span>({call.duration}ms)</span>}
                  {call.status && (
                    <span className={`rounded px-1 py-0.5 ${
                      call.status >= 200 && call.status < 300
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {call.status}
                    </span>
                  )}
                </div>
              </div>

              {call.requestBody && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                    请求体
                  </summary>
                  <pre className="mt-1 overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                    {JSON.stringify(call.requestBody, null, 2)}
                  </pre>
                </details>
              )}

              {call.responseBody && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                    响应体
                  </summary>
                  <pre className="mt-1 overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                    {JSON.stringify(call.responseBody, null, 2)}
                  </pre>
                </details>
              )}

              {call.error && (
                <div className="mt-2 text-xs text-red-600">
                  <strong>错误:</strong> {call.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-8 rounded-md bg-gray-50 p-4">
        <h3 className="mb-3 text-lg font-semibold">使用说明</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start">
            <span className="mr-2 font-medium text-blue-600">1.</span>
            <span>点击"开始监控"开始监控所有 API 调用</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2 font-medium text-blue-600">2.</span>
            <span>在左侧输入会话ID和消息内容，点击"发送消息"</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2 font-medium text-blue-600">3.</span>
            <span>观察 API 调用记录，找到发送消息的 taskId</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2 font-medium text-blue-600">4.</span>
            <span>在消息响应过程中点击"停止消息"测试停止 API</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2 font-medium text-blue-600">5.</span>
            <span>查看停止 API 的调用结果和响应状态</span>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            <strong>测试建议：</strong> 使用较长的问题来确保有足够时间测试停止功能。建议问题如："请详细解释人工智能的发展历史，包括各个重要阶段和关键技术突破"。
          </p>
        </div>
      </div>
    </div>
  )
}
