'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sendChatMessage } from '@/services'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

import { Markdown } from '@/app/components/markdown'
export default function ChatMessages() {
  const [response, setResponse] = useState<any>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [inputs, setInputs] = useState('')
  const [query, setQuery] = useState('')
  const [conversationId, setConversationId] = useState('')
  const [responseMode, setResponseMode] = useState('blocking')
  const [files, setFiles] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResponse('')

    try {
      const requestBody: Record<string, any> = {
        inputs: inputs ? JSON.parse(inputs) : {},
        query,
        files: files ? JSON.parse(files) : [],
        response_mode: responseMode,
      }
      if (conversationId)
        requestBody.conversation_id = conversationId

      console.log('请求URL:', '/api/chat-messages')
      console.log('请求体:', requestBody)
      // 适配 sendChatMessage
      let resultData: any = ''
      await sendChatMessage(requestBody, {
        onData: (data: any) => {
          console.log('onData: ', data)
          resultData += typeof data === 'string' ? data : JSON.stringify(data)
          setResponse(resultData)
        },
        onCompleted: (data) => {
          console.log('onCompleted: ', data)
        },
        onFile: () => {},
        onThought: () => {},
        onMessageEnd: (m) => {
          console.log('onMessageEnd: ', m)
        },
        onMessageReplace: (m) => {
          console.log('onMessageReplace: ', m)
        },
        onError: (err: any) => {
          setError(err?.message || '发送聊天消息失败')
        },
        onWorkflowStarted: () => {},
        onNodeStarted: () => {},
        onNodeFinished: () => {},
        onWorkflowFinished: () => {},
      })
      // 如果是阻塞模式，直接 setResponse
      if (responseMode === 'blocking')
        setResponse(resultData)

      console.log('聊天消息响应:', resultData)
    }
 catch (error) {
      console.error('发送聊天消息失败:', error)
      setError(error instanceof Error ? error.message : '发送聊天消息失败')
    }
 finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-items-center p-8 pb-20 font-sans">
      <main className="row-start-2 flex w-full max-w-3xl flex-col items-center gap-4 sm:items-start">
        <div className="flex items-center gap-4">
          <Link
            href="/test/api"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            ← 返回API测试列表
          </Link>
          <h1 className="text-2xl font-bold">聊天消息测试</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">输入参数 (JSON格式):</label>
            <Textarea
              value={inputs}
              onChange={e => setInputs(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full rounded border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">查询内容:</label>
            <Input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="请输入查询内容"
              className="w-full rounded border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">对话ID (可选):</label>
            <Input
              type="text"
              value={conversationId}
              onChange={e => setConversationId(e.target.value)}
              placeholder="对话ID"
              className="w-full rounded border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="mb-1 block text-sm font-medium">响应模式: { responseMode }</label>
            <select
              value={responseMode}
              onChange={e => setResponseMode(e.target.value)}
              className="m-0 w-full rounded border border-gray-300 p-0 px-3 py-2 text-base"
            >
              <option value="blocking">阻塞模式</option>
              <option value="streaming">流式模式</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">文件 (JSON格式):</label>
            <Textarea
              value={files}
              onChange={e => setFiles(e.target.value)}
              placeholder='[{"file_id": "xxx"}]'
              className="w-full rounded border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-500 px-4 py-2 text-base text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '发送中...' : '发送聊天消息'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 max-w-3xl rounded border border-red-400 bg-red-100 p-4 text-red-700">
            <h3 className="mb-2 font-bold">错误:</h3>
            <p className="whitespace-pre-wrap text-sm">{error}</p>
          </div>
        )}

            {/* <AgentMessage message={response}></AgentMessage> */}

            <Markdown content={response}></Markdown>
      </main>
    </div>
  )
}
