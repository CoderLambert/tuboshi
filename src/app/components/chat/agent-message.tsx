'use client'
import { Component, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { SimpleMarkdown } from './simple-markdown'

// 动态导入 ReactMarkdown 以避免 SSR 和 Turbopack 兼容性问题
const ReactMarkdown = dynamic(
    () => import('react-markdown').then(mod => ({ default: mod.default })),
    {
        ssr: false,
        loading: () => <div className="h-4 animate-pulse rounded bg-gray-200"></div>,
    },
)

// React 错误边界组件
class MarkdownErrorBoundary extends Component<
    { children: React.ReactNode; fallback: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ReactMarkdown error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError)
            return this.props.fallback

        return this.props.children
    }
}

export function AgentMessage({
    message,
}: {
    message: string;
}) {
    // 使用 useMemo 来优化性能并避免重复渲染

    return (
        <div className="markdown-body max-w-none ">
            <MarkdownErrorBoundary
                fallback={<SimpleMarkdown content={message} />}
            >
                <Suspense fallback={<div className="h-4 animate-pulse rounded bg-gray-200"></div>}>
                    <ReactMarkdown
                        components={{
                            // 自定义组件以确保兼容性
                            p: ({ children }) => <p className="mb-2">{children}</p>,
                            h1: ({ children }) => <h1 className="mb-2 text-xl font-bold">{children}</h1>,
                            h2: ({ children }) => <h2 className="mb-2 text-lg font-semibold">{children}</h2>,
                            h3: ({ children }) => <h3 className="mb-1 text-base font-medium">{children}</h3>,
                            ul: ({ children }) => <ul className="mb-2 list-disc pl-4">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 list-decimal pl-4">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            a: ({ href, children }) => (
                                <a href={href} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                                    {children}
                                </a>
                            ),
                            code: ({ children }) => (
                                <code className="rounded-[4px] bg-gray-100 px-1 py-0.5 font-mono text-sm">
                                    {children}
                                </code>
                            ),
                            pre: ({ children }) => (
                                <pre className="overflow-x-auto rounded-[4px] bg-gray-100  p-3">
                                    {children}
                                </pre>
                            ),
                        }}

                    >
                        {message}
                    </ReactMarkdown>
                </Suspense>
            </MarkdownErrorBoundary>
        </div>
    )
}
