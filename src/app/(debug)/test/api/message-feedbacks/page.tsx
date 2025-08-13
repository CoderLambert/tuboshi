'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateFeedback } from '@/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Feedbacktype, MessageRating } from '@/types/app'
export default function MessageFeedbacks() {
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [messageId, setMessageId] = useState('')
  const [rating, setRating] = useState<MessageRating>('like')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageId) {
      setError('请输入消息ID')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const requestBody: Feedbacktype = {
        rating,
      }

      const url = `/messages/${messageId}/feedbacks`
      console.log('请求URL:', url)
      console.log('请求体:', requestBody)

      const data = await updateFeedback({ url, body: requestBody })
      setResponse(data)
      console.log('消息反馈响应:', data)
    }
 catch (error) {
      console.error('发送消息反馈失败:', error)
      setError(error instanceof Error ? error.message : '发送消息反馈失败')
    }
 finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full p-2 font-sans">
      <main className="flex flex-col gap-4 ">
        <div className="flex flex-row items-center gap-4">
          <Link
            href="/test/api"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            ← 返回API测试列表
          </Link>
          <h1 className="text-2xl font-bold">消息反馈测试</h1>
        </div>

        <form onSubmit={handleSubmit} className="prose flex w-full flex-col items-start justify-start gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">消息ID:</label>
            <Input
              type="text"
              value={messageId}
              onChange={e => setMessageId(e.target.value)}
              placeholder="请输入消息ID"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="mb-1 block text-sm font-medium">评分:</label>
            <select
              value={rating ?? ''}
              onChange={e => setRating(e.target.value as MessageRating)}
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="like">喜欢</option>
              <option value="dislike">不喜欢</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading || !messageId}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '发送中...' : '发送反馈'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 max-w-3xl rounded border border-red-400 bg-red-100 p-4 text-red-700">
            <h3 className="mb-2 font-bold">错误:</h3>
            <p className="whitespace-pre-wrap text-sm">{error}</p>
          </div>
        )}

        {response && (
          <div className="prose mt-4 rounded bg-gray-100 p-4">
            <h3 className="mb-2 font-bold">反馈结果:</h3>
            <pre className="max-w-3xl overflow-auto text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
