'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Markdown } from '@/app/components/markdown'
export default function MarkdownTest() {
    const [testMessage, setTestMessage] = useState(`# AI Agent 响应示例

这是一个 **AI Agent** 的响应消息，包含了多种 Markdown 格式：

## 功能特性

- 支持 **粗体** 和 *斜体* 文本
- 支持 [链接](https://github.com/remarkjs/react-markdown)
- 支持代码块和内联代码

### 代码示例

这是一个内联代码示例：\`console.log('Hello World')\`

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}

const message = greet('用户');
console.log(message);
\`\`\`

### 图片示例

![图1](https://picsum.photos/seed/1/200/300)  
![图2](https://picsum.photos/seed/2/200/300)  
![图3](https://picsum.photos/seed/3/200/300)

<div style="display: flex; gap: 10px;">
  <img src="https://picsum.photos/200/300?random=1" width="100" alt="图1">
  <img src="https://picsum.photos/200/300?random=2" width="100" alt="图2">
</div>

### 列表示例

1. 第一项
2. 第二项
3. 第三项

### 无序列表

- 项目 A
- 项目 B
  - 子项目 B.1
  - 子项目 B.2
- 项目 C

### 引用

> 这是一个引用块，用于显示重要信息或引用其他来源的内容。

### 表格

| 功能 | 状态 | 描述 |
|------|------|------|
| Markdown 渲染 | ✅ | 支持基本 Markdown 语法 |
| 代码高亮 | ⚠️ | 基础支持 |
| 数学公式 | ❌ | 暂不支持 |

---

这就是一个完整的 Markdown 消息示例！`)

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <Link 
                    href="/test/api"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                >
                    ← 返回测试列表
                </Link>
                <h1 className="text-3xl font-bold mt-2 mb-4">Markdown 渲染测试</h1>
            </div>
            <h2 className="text-xl font-semibold mb-4 text-green-600">React Markdown 版本</h2>
            <Markdown content={testMessage} />
        </div>
    )
}
