'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fetchSuggestedQuestions } from '@/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
export default function Messages() {
  const [messageId, setMessagesId] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<any>(null)
  const handleClick = async () => {
    setLoading(true)
    setError(null)
    // setMessagesId(null)

    try {
      const data = await fetchSuggestedQuestions(messageId)
      console.log('获取的消息:', data)
      setSuggestedQuestions(data)
    }
 catch (error) {
      console.error('获取消息失败:', error)
      setError(error instanceof Error ? error.message : '获取消息失败')
    }
 finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full p-2 font-sans">
      <main className="row-start-2 flex flex-col items-center gap-[32px] sm:items-start">
        <div className="flex items-center gap-4">
          <Link
            href="/test/api"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            ← 返回API测试列表
          </Link>
          <h1 className="text-2xl font-bold">建议问题列表测试</h1>
        </div>

        <div className="flex w-full max-w-3xl flex-col gap-4">
          <Input
            type="text"
            placeholder="消息ID"
            value={messageId}
            onChange={e => setMessagesId(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleClick}
            disabled={loading}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '获取中...' : '获取消息'}
          </Button>
        </div>

        {
          <div className="prose mt-4 rounded bg-gray-100 p-4">
            <h3 className="mb-2 font-bold">获取到的建议问题:</h3>
            <p className="w-full overflow-auto text-sm">
              {JSON.stringify(suggestedQuestions, null, 2)}
            </p>
          </div>
        }
      </main>
    </div>
  )
}
