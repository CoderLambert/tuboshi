'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fetchConversations } from '@/services'
import { Button } from '@/components/ui/button'
export default function Conversations() {
  const [conversations, setConversations] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    setConversations(null)

    try {
      console.log('请求URL:', '/api/conversations')
      const data = await fetchConversations()
      setConversations(data)
      console.log('获取的对话:', data)
    }
 catch (error) {
      console.error('获取对话失败:', error)
      setError(error instanceof Error ? error.message : '获取对话失败')
    }
 finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-2">
      <main className="flex flex-col gap-2">
        <div className="flex   items-center gap-4">
          <Link
            href="/test/api"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            ← 返回API测试列表
          </Link>
          <h1 className="text-2xl font-bold">对话列表测试</h1>
        </div>

        <Button
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? '获取中...' : '获取对话列表'}
        </Button>

        {error && (
          <div className="mt-4 max-w-3xl rounded border border-red-400 bg-red-100 p-4 text-red-700">
            <h3 className="mb-2 font-bold">错误:</h3>
            <p className="whitespace-pre-wrap text-sm">{error}</p>
          </div>
        )}

        {conversations && (
          <div className="prose mt-4 rounded bg-gray-100 p-4">
            <h3 className="prose-h3 mb-2 font-bold">获取到的对话:</h3>
            <pre className="max-w-3xl overflow-auto text-sm">
              {JSON.stringify(conversations, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
