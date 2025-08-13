'use client'

import { useState } from 'react'
import Flowchart from '@/app/components/base/mermaid'

export default function TestMermaidPage() {
  const [selectedCode, setSelectedCode] = useState('simple')

  const mermaidCodes = {
    simple: `graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[显示登录页]
    C --> E[结束]
    D --> F[用户登录]
    F --> C`,

    flowchart: `flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
    D --> G[Result]
    E --> G
    F --> G`,

    sequence: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`,
  }

  return (
    <div className="prose p-4">
      <h1 className="mb-4 text-2xl font-bold">Mermaid 经典模式测试</h1>
      <p className="mb-4 text-gray-600">已重构为仅支持经典模式，移除了手绘模式和风格切换按钮</p>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">选择测试图表:</label>
        <select
          value={selectedCode}
          onChange={e => setSelectedCode(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="simple">简单流程图</option>
          <option value="flowchart">复杂流程图</option>
          <option value="sequence">时序图</option>
        </select>
      </div>

      <div className="rounded-sm border border-gray-300">
        <Flowchart PrimitiveCode={mermaidCodes[selectedCode as keyof typeof mermaidCodes]} />
      </div>

      <div className="mt-4 rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-semibold">当前代码:</h3>
        <pre className="overflow-auto rounded border bg-white p-2 text-sm">
          {mermaidCodes[selectedCode as keyof typeof mermaidCodes]}
        </pre>
      </div>
    </div>
  )
}
