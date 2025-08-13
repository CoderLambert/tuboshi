'use client'
import Link from 'next/link'
import { Markdown } from '@/app/components/markdown'
// @ts-expect-error: TypeScript module declaration for .md files is required
import testContent from './test-content.md'

export default function MarkdownTest() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link 
          href="/test/api"
          className="text-blue-500 hover:text-blue-700 text-sm p-0 m-0 block"
        >
          ← 返回测试列表
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-4">Markdown 渲染测试</h1>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-green-600">React Markdown 版本</h2>
      <Markdown content={testContent} />
    </div>
  )
}