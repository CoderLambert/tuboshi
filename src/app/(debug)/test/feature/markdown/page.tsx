'use client'
import { Markdown } from '@/app/components/markdown'
// @ts-expect-error: TypeScript module declaration for .md files is required
import testContent from './test-content.md'
export default function MarkdownTest() {
  return (
    <div className='mt-4'>
        <Markdown content={testContent} />
    </div>
  )
}