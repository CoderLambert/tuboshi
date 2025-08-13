import Link from "next/link";
export default function TestPage({
  children,
}: {
  children: React.ReactNode
}) { 
    return (
        <div className="container w-full p-4">
            <div className="mb-6">
                <Link 
                    href="/test/api"
                    className="text-blue-500 hover:text-blue-700 text-sm p-0 m-0 block"
                >
                    ← Api 测试列表
                </Link>

            <div className="mt-4 flex flex-col gap-4">
                <h3 className="mt-0 text-2xl font-bold">页面测试</h3>
            <Link 
                    href="/test/page/i18n"
                    className="text-blue-500 hover:text-blue-700 text-sm p-0 m-0 block"
                >
                    i18n 测试
                </Link>
                <Link 
                    href="/test/page/mermaid"
                    className="text-blue-500 hover:text-blue-700 text-sm p-0 m-0 block"
                >
                    mermaid 测试
                </Link>
                 <Link 
                    href="/test/page/width"
                    className="text-blue-500 hover:text-blue-700 text-sm p-0 m-0 block"
                >
                    width 测试
                </Link>
                <Link 
                    href="/test/page/markdown"
                    className="text-blue-500 hover:text-blue-700 text-sm p-0 m-0 block"
                >
                    md 测试
                </Link>
            </div>
                {children}
            </div>
        </div>
    )

}