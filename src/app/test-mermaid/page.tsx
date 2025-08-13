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
    Bob-->>John: Jolly good!`
  }

  return (
    <div className="p-4 prose">
      <h1 className="text-2xl font-bold mb-4">Mermaid 经典模式测试</h1>
      <p className="text-gray-600 mb-4">已重构为仅支持经典模式，移除了手绘模式和风格切换按钮</p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">选择测试图表:</label>
        <select
          value={selectedCode}
          onChange={(e) => setSelectedCode(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="simple">简单流程图</option>
          <option value="flowchart">复杂流程图</option>
          <option value="sequence">时序图</option>
        </select>
      </div>

      <div className="border border-gray-300 rounded-sm">
        <Flowchart PrimitiveCode={mermaidCodes[selectedCode as keyof typeof mermaidCodes]} />
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">当前代码:</h3>
        <pre className="text-sm bg-white p-2 rounded border overflow-auto">
          {mermaidCodes[selectedCode as keyof typeof mermaidCodes]}
        </pre>
      </div>
    </div>
  )
}
