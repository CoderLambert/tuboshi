'use client'
import { useCallback, useState } from 'react'
import HistoryMessage from '@/app/components/chat/history-message'
import type { ChatItem } from '@/types/app'

export default function KeyUniquenessTestPage() {
  // 模拟历史消息数据，包含可能导致key冲突的情况
  const [historyMessages, setHistoryMessages] = useState<ChatItem[]>([])
  const [keyStats, setKeyStats] = useState<{ total: number; unique: number; duplicates: string[] }>({
    total: 0,
    unique: 0,
    duplicates: [],
  })

  // 生成测试数据
  const generateTestData = useCallback(() => {
    const testData: ChatItem[] = []
    const baseId = 'f93ef40c-2e8f-453d-853a-c50c61e7e675' // 使用报错中的ID

    // 模拟API返回的数据结构
    const apiData = [
      { id: baseId, query: '第一个问题', answer: '第一个回答' },
      { id: 'another-id-123', query: '第二个问题', answer: '第二个回答' },
      { id: 'third-id-456', query: '第三个问题', answer: '第三个回答' },
    ]

    // 按照loadHistoryMessages的逻辑生成ChatItem
    apiData.forEach((item: any) => {
      testData.push({
        id: `question-${item.id}`, // 保留原始ID格式
        key: `history-question-${item.id}`, // 新增key属性用于React渲染
        content: item.query,
        isAnswer: false,
        message_files: [],
      })
      testData.push({
        id: item.id, // 保留原始ID
        key: `history-answer-${item.id}`, // 新增key属性用于React渲染
        content: item.answer,
        isAnswer: true,
        message_files: [],
      })
    })

    setHistoryMessages(testData)

    // 分析key的唯一性（使用key属性而不是id）
    const keys = testData.map(item => item.key || item.id)
    const uniqueKeys = new Set(keys)
    const duplicates: string[] = []

    keys.forEach((key, index) => {
      if (keys.indexOf(key) !== index && !duplicates.includes(key))
        duplicates.push(key)
    })

    setKeyStats({
      total: keys.length,
      unique: uniqueKeys.size,
      duplicates,
    })
  }, [])

  // 清空数据
  const clearData = useCallback(() => {
    setHistoryMessages([])
    setKeyStats({ total: 0, unique: 0, duplicates: [] })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Key唯一性测试</h1>

        {/* 控制面板 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">控制面板</h2>
          <div className="flex gap-4">
            <button
              onClick={generateTestData}
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              生成测试数据
            </button>

            <button
              onClick={clearData}
              className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              清空数据
            </button>
          </div>
        </div>

        {/* Key统计信息 */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">总Key数量</h3>
            <p className="text-2xl font-bold text-blue-600">{keyStats.total}</p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">唯一Key数量</h3>
            <p className={`text-2xl font-bold ${keyStats.unique === keyStats.total ? 'text-green-600' : 'text-red-600'}`}>
              {keyStats.unique}
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-500">重复Key数量</h3>
            <p className={`text-2xl font-bold ${keyStats.duplicates.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
              {keyStats.duplicates.length}
            </p>
          </div>
        </div>

        {/* 重复Key详情 */}
        {keyStats.duplicates.length > 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-900">发现重复的Key</h3>
            <ul className="space-y-1 text-sm text-red-800">
              {keyStats.duplicates.map((key, index) => (
                <li key={index} className="font-mono">{key}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Key列表 */}
        <div className="mb-6 rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold">所有Key列表</h2>
            <p className="text-sm text-gray-600">
              显示所有生成的ChatItem的ID
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto p-4">
            {historyMessages.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                暂无数据，请点击"生成测试数据"
              </div>
            ) : (
              <div className="space-y-2">
                {historyMessages.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded bg-gray-50 p-2">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm">ID: {item.id}</span>
                      <span className="font-mono text-xs text-gray-500">Key: {item.key || item.id}</span>
                    </div>
                    <span className={`rounded px-2 py-1 text-xs ${
                      item.isAnswer ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.isAnswer ? 'Answer' : 'Question'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 渲染测试 */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold">HistoryMessage渲染测试</h2>
            <p className="text-sm text-gray-600">
              测试HistoryMessage组件的渲染，检查是否有key冲突错误
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto p-4">
            {historyMessages.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                暂无消息
              </div>
            ) : (
              <div className="space-y-3">
                {historyMessages.map(item => (
                  <HistoryMessage key={item.key || item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 测试说明 */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-900">测试说明</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✅ <strong>ID保留</strong>: 保留原始ID格式，不影响其他逻辑</li>
            <li>✅ <strong>Key分离</strong>: 新增key属性专门用于React渲染</li>
            <li>✅ <strong>Key生成规则</strong>: 问题使用`history-question-${id}`，回答使用`history-answer-${id}`</li>
            <li>✅ <strong>唯一性保证</strong>: 每个ChatItem都有唯一的key属性</li>
            <li>✅ <strong>冲突检测</strong>: 自动检测并显示重复的key</li>
            <li>✅ <strong>渲染验证</strong>: 在浏览器控制台检查是否有React key警告</li>
          </ul>
        </div>

        {/* 修复方案说明 */}
        <div className="mt-4 rounded-lg bg-green-50 p-4">
          <h3 className="mb-2 font-semibold text-green-900">修复方案</h3>
          <div className="space-y-2 text-sm text-green-800">
            <p><strong>问题原因</strong>: 原来的ID生成可能导致问题和回答使用相同的React key</p>
            <p><strong>解决方案</strong>: 保留原始ID，新增独立的key属性用于React渲染</p>
            <ul className="ml-4 space-y-1">
              <li>• 保留原始ID格式: 问题`question-${id}`，回答`${id}`</li>
              <li>• 新增key属性: 问题`history-question-${id}`，回答`history-answer-${id}`</li>
              <li>• React渲染使用key属性，其他逻辑使用原始ID</li>
              <li>• 确保不影响现有的API调用和业务逻辑</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
