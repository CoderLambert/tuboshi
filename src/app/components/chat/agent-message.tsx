'use client'
import style from './style.module.css'
import { Suspense, useMemo, Component } from 'react'
import dynamic from 'next/dynamic'
import { SimpleMarkdown } from './simple-markdown'

// 动态导入 ReactMarkdown 以避免 SSR 和 Turbopack 兼容性问题
const ReactMarkdown = dynamic(
    () => import('react-markdown').then((mod) => ({ default: mod.default })),
    {
        ssr: false,
        loading: () => <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
    }
)

// React 错误边界组件
class MarkdownErrorBoundary extends Component<
    { children: React.ReactNode; fallback: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ReactMarkdown error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}

export function AgentMessage({
    message
}: {
    message: string;
}) {
    // 使用 useMemo 来优化性能并避免重复渲染
  

    return (
        <div className="markdown-body max-w-none ">
            <MarkdownErrorBoundary
                fallback={<SimpleMarkdown content={message} />}
            >
                <Suspense fallback={<div className="animate-pulse bg-gray-200 h-4 rounded"></div>}>
                    <ReactMarkdown
                        components={{
                            // 自定义组件以确保兼容性
                            p: ({ children }) => <p className="mb-2">{children}</p>,
                            h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-medium mb-1">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            a: ({ href, children }) => (
                                <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                                    {children}
                                </a>
                            ),
                            code: ({ children }) => (
                                <code className="bg-gray-100 px-1 py-0.5 rounded-[4px] text-sm font-mono">
                                    {children}
                                </code>
                            ),
                            pre: ({ children }) => (
                                <pre className="bg-gray-100 p-3 rounded-[4px]  overflow-x-auto">
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