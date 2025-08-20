'use client'
import { useState } from 'react'

export default function SimpleInputTestPage() {
  const [value, setValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('Input change:', e.target.value)
    setValue(e.target.value)
  }

  const handleSend = () => {
    console.log('Send:', value)
    alert(`发送消息: ${value}`)
    setValue('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">简单输入框测试</h1>
        
        <div className="mb-4">
          <p>当前值: {value}</p>
          <p>字符数: {value.length}</p>
        </div>

        <div className="relative rounded-lg border-2 border-gray-300 bg-white p-4">
          <textarea
            className="w-full resize-none border-none outline-none"
            value={value}
            onChange={handleChange}
            placeholder="请输入消息..."
            rows={3}
          />
          <button
            onClick={handleSend}
            className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            disabled={!value.trim()}
          >
            发送
          </button>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">测试说明</h2>
          <ul className="space-y-2 text-sm">
            <li>• 这是一个最简单的输入框测试</li>
            <li>• 如果这个能正常输入，说明基础功能正常</li>
            <li>• 如果不能输入，说明可能是环境或浏览器问题</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
