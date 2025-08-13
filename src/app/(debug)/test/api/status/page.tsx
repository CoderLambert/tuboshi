'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fetchAppParams, fetchChatList, fetchConversations } from '@/services'
import { Button } from '@/components/ui/button'
export default function ApiStatus() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkApiStatus = async () => {
    setLoading(true)
    setError(null)
    setStatus(null)

    try {
      // 检查参数API
      console.log('检查参数API...')
      let paramsData, conversationsData, messagesData
      let paramsStatus = 200; let conversationsStatus = 200; let messagesStatus = 200
      let paramsOk = true; let conversationsOk = true; let messagesOk = true
      let paramsError = ''; let conversationsError = ''; let messagesError = ''
      try {
        paramsData = await fetchAppParams()
      }
 catch (e: any) {
        paramsStatus = e?.response?.status || 500
        paramsOk = false
        paramsError = e?.message || '未知错误'
      }
      console.log('参数API状态:', paramsStatus)

      // 检查对话API
      console.log('检查对话API...')
      try {
        conversationsData = await fetchConversations()
      }
 catch (e: any) {
        conversationsStatus = e?.response?.status || 500
        conversationsOk = false
        conversationsError = e?.message || '未知错误'
      }
      console.log('对话API状态:', conversationsStatus)

      // 检查消息API
      console.log('检查消息API...')
      try {
        messagesData = await fetchChatList('')
      }
 catch (e: any) {
        messagesStatus = e?.response?.status || 500
        messagesOk = false
        messagesError = e?.message || '未知错误'
      }
      console.log('消息API状态:', messagesStatus)

      const statusData = {
        timestamp: new Date().toISOString(),
        parameters: {
          status: paramsStatus,
          ok: paramsOk,
          url: '/api/parameters',
          error: paramsOk ? undefined : paramsError,
        },
        conversations: {
          status: conversationsStatus,
          ok: conversationsOk,
          url: '/api/conversations',
          error: conversationsOk ? undefined : conversationsError,
        },
        messages: {
          status: messagesStatus,
          ok: messagesOk,
          url: '/api/messages',
          error: messagesOk ? undefined : messagesError,
        },
      }
      setStatus(statusData)
      console.log('API状态检查结果:', statusData)
    }
 catch (error) {
      console.error('API状态检查失败:', error)
      setError(error instanceof Error ? error.message : 'API状态检查失败')
    }
 finally {
      setLoading(false)
    }
  }

  const getStatusColor = (ok: boolean) => {
    return ok ? 'text-green-600' : 'text-red-600'
  }

  const getStatusText = (ok: boolean) => {
    return ok ? '正常' : '错误'
  }

  return (
    <div className="w-full p-2 font-sans">
      <main className="row-start-2 flex w-full max-w-2xl flex-col items-center gap-[32px] sm:items-start">
        <div className="flex items-center gap-4">
          <Link
            href="/test/api"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            ← 返回API测试列表
          </Link>
          <h1 className="text-2xl font-bold">API状态检查</h1>
        </div>

        <Button
          onClick={checkApiStatus}
          disabled={loading}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '检查中...' : '检查API状态'}
        </Button>

        {error && (
          <div className="mt-4 max-w-3xl rounded border border-red-400 bg-red-100 p-4 text-red-700">
            <h3 className="mb-2 font-bold">错误:</h3>
            <p className="whitespace-pre-wrap text-sm">{error}</p>
          </div>
        )}

        {status && (
          <div className="prose mx-2 mt-4 w-full rounded bg-gray-100 p-4">
            <h3 className="mb-4 font-bold">API状态检查结果:</h3>
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-semibold">检查时间: {status.timestamp}</h4>
              </div>

              {Object.entries(status).filter(([key]) => key !== 'timestamp').map(([apiName, apiStatus]: [string, any]) => (
                <div key={apiName} className="prose mx-2 rounded border border-gray-300 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h5 className="font-medium capitalize">{apiName} API</h5>
                    <span className={`font-semibold ${getStatusColor(apiStatus.ok)}`}>
                      {getStatusText(apiStatus.ok)} ({apiStatus.status})
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-gray-600">URL: {apiStatus.url}</p>
                  {apiStatus.error && (
                    <div className="mt-2 rounded border border-red-200 bg-red-50 p-2">
                      <p className="whitespace-pre-wrap text-xs text-red-700">{apiStatus.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
