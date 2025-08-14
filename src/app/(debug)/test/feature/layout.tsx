import { Button } from '@/app/components/base/button'
import Link from 'next/link'
export default function TestPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
        <div className="container w-full p-4">
            <div className="mb-6">
                <Link
                    href="/test/api"
                    className="m-0 block p-0 text-sm text-blue-500 hover:text-blue-700"
                >
                    ← Api 测试列表
                </Link>

            <div className="mt-4 flex flex-col gap-4">
                <h3 className="mt-0 text-2xl font-bold">页面测试</h3>
            <Link
                    href="/test/feature/i18n"
                    className="m-0 block p-0 text-sm text-blue-500 hover:text-blue-700"
                >
                    i18n 测试
                </Link>
                <Link
                    href="/test/feature/mermaid"
                    className="m-0 block p-0 text-sm text-blue-500 hover:text-blue-700"
                >
                    mermaid 测试
                </Link>
                 <Link
                    href="/test/feature/width"
                    className="m-0 block p-0 text-sm text-blue-500 hover:text-blue-700"
                >
                    width 测试
                </Link>
                <Link
                    href="/test/feature/markdown"
                    className="m-0 block p-0 text-sm text-blue-500 hover:text-blue-700"
                >
                    md 测试
                </Link>

                  <Link
                    href="/test/feature/markdown/thinking"
                    className="text-sm text-blue-500 hover:text-blue-700"
                >
                    thinking 模型测试
                </Link>
            <Button variant='primary'>Primary</Button>
            </div>
                {children}
            </div>
        </div>
    )
}
