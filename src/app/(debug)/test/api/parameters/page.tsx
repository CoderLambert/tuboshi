'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fetchAppParams } from '@/services'
import { Button } from '@/components/ui/button'
export default function Parameters() {
  const [parameters, setParameters] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    setParameters(null)

    try {
      console.log('请求URL:', '/api/parameters')
      const data = await fetchAppParams()
      setParameters(data)
      console.log('获取的参数:', data)
    }
 catch (error) {
      console.error('获取参数失败:', error)
      setError(error instanceof Error ? error.message : '获取参数失败')
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
          <h1 className="text-2xl font-bold">参数获取测试</h1>
        </div>

        <Button
          onClick={handleClick}
          disabled={loading}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '获取中...' : '获取参数'}
        </Button>

        {error && (
          <div className="mt-4 max-w-3xl rounded border border-red-400 bg-red-100 p-4 text-red-700">
            <h3 className="mb-2 font-bold">错误:</h3>
            <p className="whitespace-pre-wrap text-sm">{error}</p>
          </div>
        )}

        {parameters && (
          <div className="prose mt-4 rounded bg-gray-100 p-4">
            <h3 className="mb-2 font-bold">获取到的参数:</h3>
            <pre className="max-w-3xl overflow-auto text-sm">
              {JSON.stringify(parameters, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
