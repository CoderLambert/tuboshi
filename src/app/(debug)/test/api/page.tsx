'use client'

import Link from 'next/link'

export default function ApiTestIndex() {
  const apiTests = [
    {
      name: 'API状态检查',
      description: '检查所有API的连接状态和错误信息',
      path: '/test/api/status',
      method: 'GET',
    },
    {
      name: '配置检查',
      description: '检查当前API配置信息',
      path: '/test/api/config',
      method: 'GET',
    },
    {
      name: '参数获取',
      description: '测试获取系统参数',
      path: '/test/api/parameters',
      method: 'GET',
    },
    {
      name: '消息列表',
      description: '测试获取消息列表',
      path: '/test/api/messages',
      method: 'GET',
    },
    {
      name: '对话列表',
      description: '测试获取对话列表',
      path: '/test/api/conversations',
      method: 'GET',
    },
    {
      name: '聊天消息',
      description: '测试发送聊天消息',
      path: '/test/api/chat-messages',
      method: 'POST',
    },
    {
      name: '文件上传',
      description: '测试文件上传功能',
      path: '/test/api/file-upload',
      method: 'POST',
    },
    {
      name: '消息反馈',
      description: '测试消息反馈功能',
      path: '/test/api/message-feedbacks',
      method: 'POST',
    },
    {
      name: '对话重命名',
      description: '测试重命名对话功能',
      path: '/test/api/conversation-name',
      method: 'POST',
    },
  ]

  return (
    <div className="min-h-screen  p-4 pb-20 font-sans">
      <main className="flex w-full flex-col gap-4">
        <div className="m-0 block p-0">
          <div className="flex flex-col gap-4 ">
            <Link
            href="/test/feature/markdown"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            ← 返回页面测试列表
          </Link>
          <h1 className="mb-4 mt-0 text-3xl font-bold">API 测试页面</h1>
             </div>

          <p className="text-base text-gray-600">选择要测试的API功能</p>
        </div>

        <div className="flex w-full flex-col gap-4">
          {apiTests.map((test, index) => (
            <Link
              key={index}
              href={test.path}
              className="block rounded-lg  border border-gray-200 bg-white px-6 py-3 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                <span className={`rounded px-2 py-1 text-xs font-medium ${
                  test.method === 'GET'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {test.method}
                </span>
              </div>
              <p className="text-sm text-gray-600">{test.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
