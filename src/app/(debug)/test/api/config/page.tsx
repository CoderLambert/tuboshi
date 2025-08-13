'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
export default function ConfigCheck() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkConfig = async () => {
    setLoading(true)
    setError(null)
    setConfig(null)

    try {
      // 获取配置信息
      const response = await fetch('/api/config')

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      setConfig(data)
      console.log('配置信息:', data)
    }
 catch (error) {
      console.error('获取配置失败:', error)
      setError(error instanceof Error ? error.message : '获取配置失败')
    }
 finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold">配置检查</h1>
        </div>

        <Button
          onClick={checkConfig}
          disabled={loading}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '检查中...' : '检查配置'}
        </Button>

        {error && (
          <div className="mt-4 max-w-3xl rounded border border-red-400 bg-red-100 p-4 text-red-700">
            <h3 className="mb-2 font-bold">错误:</h3>
            <p className="whitespace-pre-wrap text-sm">{error}</p>
          </div>
        )}

        {config && (
          <div className="prose mt-4 w-full rounded bg-gray-100 p-4">
            <h3 className="mb-4 font-bold">配置信息:</h3>
            <p className="max-w-full overflow-auto rounded border bg-white p-4 text-sm">
              {JSON.stringify(config, null, 2)}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
