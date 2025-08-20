'use client'
import React, { useEffect, useRef, useState } from 'react'

type PerformanceMetrics = {
  renderTime: number
  inputLag: number
  memoryUsage: number
  componentCount: number
  reRenderCount: number
}

type PerformanceMonitorProps = {
  chatListLength: number
  isVisible?: boolean
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  chatListLength,
  isVisible = false,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    inputLag: 0,
    memoryUsage: 0,
    componentCount: 0,
    reRenderCount: 0,
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const renderCountRef = useRef(0)
  const lastRenderTimeRef = useRef(0)

  // 监控渲染性能
  useEffect(() => {
    renderCountRef.current += 1
    const renderTime = performance.now() - lastRenderTimeRef.current
    lastRenderTimeRef.current = performance.now()

    setMetrics(prev => ({
      ...prev,
      renderTime,
      reRenderCount: renderCountRef.current,
      componentCount: chatListLength * 2, // 估算组件数量
    }))
  }, [chatListLength])

  // 监控内存使用
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        }))
      }
    }

    const interval = setInterval(updateMemoryUsage, 1000)
    return () => clearInterval(interval)
  }, [])

  // 监控输入延迟
  const measureInputLag = (callback: () => void) => {
    const startTime = performance.now()
    callback()
    requestAnimationFrame(() => {
      const endTime = performance.now()
      setMetrics(prev => ({
        ...prev,
        inputLag: endTime - startTime,
      }))
    })
  }

  if (!isVisible) return null

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'text-green-500'
    if (value < thresholds[1]) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <div
          className="flex cursor-pointer items-center justify-between rounded-t-lg bg-gray-50 p-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-sm font-medium">性能监控</span>
          <span className="text-xs text-gray-500">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>

        {isExpanded && (
          <div className="space-y-2 p-3 text-xs">
            <div className="flex justify-between">
              <span>消息数量:</span>
              <span className="font-mono">{chatListLength}</span>
            </div>

            <div className="flex justify-between">
              <span>渲染时间:</span>
              <span className={`font-mono ${getPerformanceColor(metrics.renderTime, [16, 50])}`}>
                {metrics.renderTime.toFixed(1)}ms
              </span>
            </div>

            <div className="flex justify-between">
              <span>输入延迟:</span>
              <span className={`font-mono ${getPerformanceColor(metrics.inputLag, [20, 50])}`}>
                {metrics.inputLag.toFixed(1)}ms
              </span>
            </div>

            <div className="flex justify-between">
              <span>内存使用:</span>
              <span className={`font-mono ${getPerformanceColor(metrics.memoryUsage, [50, 100])}`}>
                {metrics.memoryUsage}MB
              </span>
            </div>

            <div className="flex justify-between">
              <span>重渲染次数:</span>
              <span className="font-mono">{metrics.reRenderCount}</span>
            </div>

            <div className="flex justify-between">
              <span>组件数量:</span>
              <span className="font-mono">{metrics.componentCount}</span>
            </div>

            <div className="mt-2 border-t pt-2">
              <div className="text-xs text-gray-500">
                <div>🟢 &lt;16ms/20ms 优秀</div>
                <div>🟡 16-50ms/20-50ms 可接受</div>
                <div>🔴 &gt;50ms 需要优化</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 性能测试Hook
export const usePerformanceTest = () => {
  const [testResults, setTestResults] = useState<{
    beforeOptimization: PerformanceMetrics
    afterOptimization: PerformanceMetrics
  } | null>(null)

  const runPerformanceTest = async (messageCount: number) => {
    console.log(`开始性能测试，消息数量: ${messageCount}`)

    // 测试前的性能
    const beforeStart = performance.now()

    // 模拟大量消息渲染
    await new Promise((resolve) => {
      setTimeout(() => {
        const beforeEnd = performance.now()
        const beforeMetrics: PerformanceMetrics = {
          renderTime: beforeEnd - beforeStart,
          inputLag: 0,
          memoryUsage: 0,
          componentCount: messageCount * 2,
          reRenderCount: 1,
        }

        console.log('优化前性能:', beforeMetrics)

        // 这里可以添加优化后的测试逻辑
        setTestResults({
          beforeOptimization: beforeMetrics,
          afterOptimization: beforeMetrics, // 暂时使用相同数据
        })

        resolve(void 0)
      }, 100)
    })
  }

  return { testResults, runPerformanceTest }
}

export default PerformanceMonitor
