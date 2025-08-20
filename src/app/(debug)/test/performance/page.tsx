'use client'

import { useCallback, useRef, useState } from 'react'
import { EVENTS, eventBus } from '@/app/utils/event-bus'
import Main from '@/app/components'
import type { ChatItem } from '@/types/app'

// 生成大量测试消息
const generateTestMessages = (count: number): ChatItem[] => {
  const messages: ChatItem[] = []

  for (let i = 0; i < count; i++) {
    // 用户消息
    messages.push({
      id: `question-${i}`,
      content: `这是第${i + 1}条用户消息，用于测试性能。包含一些较长的文本内容来模拟真实场景下的消息长度。`,
      isAnswer: false,
      message_files: [],
    })

    // AI回复
    messages.push({
      id: `answer-${i}`,
      content: `这是第${i + 1}条AI回复消息。包含更长的内容来测试渲染性能：

## 标题
这是一个包含markdown格式的回复，用于测试复杂内容的渲染性能。

### 列表内容
- 项目1：详细描述内容
- 项目2：更多详细描述
- 项目3：额外的描述信息

\`\`\`javascript
// 代码块示例
function testFunction() {
  console.log('测试代码块渲染性能');
  return true;
}
\`\`\`

这样的内容可以更好地模拟真实使用场景中的性能表现。`,
      isAnswer: true,
      message_files: [],
      agent_thoughts: [],
    })
  }

  return messages
}

export default function PerformancePage() {
  const [messageCount, setMessageCount] = useState(10)
  const [inputValue, setInputValue] = useState('')
  const [renderTime, setRenderTime] = useState(0)
  const [inputLag, setInputLag] = useState(0)
  const renderStartRef = useRef<number>(0)
  const inputStartRef = useRef<number>(0)

  // 性能监控
  const measureRenderTime = useCallback(() => {
    renderStartRef.current = performance.now()

    // 使用 requestAnimationFrame 来测量渲染完成时间
    requestAnimationFrame(() => {
      const endTime = performance.now()
      setRenderTime(endTime - renderStartRef.current)
    })
  }, [])

  const measureInputLag = useCallback((value: string) => {
    const startTime = performance.now()
    setInputValue(value)

    // 测量状态更新到DOM更新的时间
    requestAnimationFrame(() => {
      const endTime = performance.now()
      setInputLag(endTime - startTime)
    })
  }, [])

  // 模拟发送消息
  const handleSendTestMessage = useCallback(() => {
    measureRenderTime()
    eventBus.emit(EVENTS.SEND_MESSAGE, `测试消息 ${Date.now()}`)
  }, [measureRenderTime])

  // 生成测试数据
  const handleGenerateMessages = useCallback((count: number) => {
    measureRenderTime()
    setMessageCount(count)

    // 生成测试消息并发送到聊天组件
    const testMessages = generateTestMessages(count)
    testMessages.forEach((message, index) => {
      setTimeout(() => {
        eventBus.emit(EVENTS.SEND_MESSAGE, message.content)
      }, index * 100) // 每100ms发送一条消息
    })
  }, [measureRenderTime])

  // 输入性能测试
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    measureInputLag(e.target.value)
  }, [measureInputLag])

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* 性能监控面板 */}
      <div className="shrink-0 border-b bg-gray-50 p-4">
        <h1 className="mb-4 text-xl font-bold">聊天性能测试页面</h1>

        <div className="mb-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label>消息数量:</label>
            <select
              value={messageCount}
              onChange={e => handleGenerateMessages(Number(e.target.value))}
              className="rounded border px-2 py-1"
            >
              <option value={10}>10条</option>
              <option value={50}>50条</option>
              <option value={100}>100条</option>
              <option value={200}>200条</option>
              <option value={500}>500条</option>
            </select>
          </div>

          <button
            onClick={handleSendTestMessage}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            发送测试消息
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-6">
          <div className="text-sm">
            <span className="font-semibold">渲染时间:</span>
            <span className={`ml-1 ${renderTime > 100 ? 'text-red-500' : renderTime > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
              {renderTime.toFixed(2)}ms
            </span>
          </div>

          <div className="text-sm">
            <span className="font-semibold">输入延迟:</span>
            <span className={`ml-1 ${inputLag > 50 ? 'text-red-500' : inputLag > 20 ? 'text-yellow-500' : 'text-green-500'}`}>
              {inputLag.toFixed(2)}ms
            </span>
          </div>

          <div className="text-sm">
            <span className="font-semibold">当前消息数:</span>
            <span className="ml-1">{messageCount * 2}条</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">输入性能测试:</label>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="在此输入文字测试输入延迟..."
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            快速输入文字观察延迟情况。绿色(&lt;20ms)正常，黄色(20-50ms)可接受，红色(&gt;50ms)需要优化
          </p>
        </div>
      </div>

      {/* 聊天区域 */}
      <div className="min-h-0 flex-1">
        <Main params={{}} />
      </div>
    </div>
  )
}
