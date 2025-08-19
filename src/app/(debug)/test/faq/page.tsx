'use client'

import { useState, useEffect } from 'react'
import { EVENTS, eventBus } from '@/app/utils/event-bus'
import FAQGuide from '@/app/components/FAQGuide'
import type { INaviAppSuggestionQuestionItem } from '@/types/app'

export default function FAQTestPage() {
  const [messages, setMessages] = useState<Array<{ id: string; content: string; isAnswer: boolean }>>([])
  const [isResponding, setIsResponding] = useState(false)

  const questions: INaviAppSuggestionQuestionItem[] = [
    {
      收派: [
        '联系不上客户怎么办？',
        '打火机可以寄吗？',
        '包装破损了怎么办？',
      ],
    },
    {
      数据统计: [
        '最近七天订单数量？',
        '如何查看配送统计？',
        '客户满意度如何？',
      ],
    },
  ]

  // 模拟消息发送处理
  useEffect(() => {
    const handleSendMessage = (message: string) => {
      console.log('FAQ问题被点击:', message)
      
      // 添加用户消息
      const userMessage = {
        id: `user-${Date.now()}`,
        content: message,
        isAnswer: false,
      }
      
      setMessages(prev => [...prev, userMessage])
      setIsResponding(true)

      // 模拟AI回复
      setTimeout(() => {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          content: `这是对"${message}"的回复。这是一个模拟的AI回复，用于测试FAQ功能是否正常工作。`,
          isAnswer: true,
        }
        
        setMessages(prev => [...prev, aiMessage])
        setIsResponding(false)
      }, 2000)
    }

    eventBus.on(EVENTS.SEND_MESSAGE, handleSendMessage)

    return () => {
      eventBus.off(EVENTS.SEND_MESSAGE, handleSendMessage)
    }
  }, [])

  const handleQuestionClick = (question: string) => {
    eventBus.emit(EVENTS.SEND_MESSAGE, question)
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <div className="flex h-screen flex-col p-4">
      <h1 className="mb-4 text-2xl font-bold">FAQ功能测试页面</h1>
      
      <div className="mb-4 flex gap-2">
        <button
          onClick={clearMessages}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          清空消息
        </button>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-lg font-semibold">FAQ组件</h2>
        <FAQGuide
          suggestions={questions}
          onQuestionClick={handleQuestionClick}
        />
      </div>

      <div className="flex-1 border border-gray-300">
        <div className="h-full overflow-y-auto p-4">
          <h3 className="mb-4 font-semibold">对话记录</h3>
          
          {messages.length === 0 && (
            <div className="text-center text-gray-500">
              点击上方FAQ问题开始对话
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isAnswer ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isAnswer
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  <div className="text-xs opacity-70 mb-1">
                    {message.isAnswer ? 'AI助手' : '用户'}
                  </div>
                  <div>{message.content}</div>
                </div>
              </div>
            ))}

            {isResponding && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-lg bg-gray-100 p-3 text-gray-800">
                  <div className="text-xs opacity-70 mb-1">AI助手</div>
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-semibold">测试说明：</h3>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>点击FAQ问题，观察是否正确触发消息发送</li>
          <li>检查对话记录是否正确显示用户问题和AI回复</li>
          <li>验证FAQ点击后不会清空现有对话</li>
          <li>测试多次点击不同FAQ问题的连续性</li>
        </ul>
      </div>
    </div>
  )
}
