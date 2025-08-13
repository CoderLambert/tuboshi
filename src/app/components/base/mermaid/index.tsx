import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import LoadingAnim from '@/app/components/base/chat/chat/loading-anim'
import cn from '@/utils/classnames'
import ImagePreview from '@/app/components/base/image-uploader/image-preview'

// Global flag for mermaid initialization
let isMermaidInitialized = false

/**
 * Checks if mermaid code is complete and valid
 */
function isMermaidCodeComplete(code: string): boolean {
  if (!code || code.trim().length === 0) return false

  const trimmedCode = code.trim()

  // Check for basic syntax structure
  const hasValidStart = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|pie|er|journey|requirementDiagram)/.test(trimmedCode)

  return hasValidStart && trimmedCode.length > 20
}

/**
 * Converts SVG to base64 string for image rendering
 */
function svgToBase64(svgGraph: string): Promise<string> {
  if (!svgGraph) return Promise.resolve('')

  try {
    // Ensure SVG has correct XML declaration
    if (!svgGraph.includes('<?xml'))
      svgGraph = `<?xml version="1.0" encoding="UTF-8"?>${svgGraph}`

    const blob = new Blob([new TextEncoder().encode(svgGraph)], {
      type: 'image/svg+xml;charset=utf-8',
    })

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
 catch (error) {
    console.error('Error converting SVG to base64:', error)
    return Promise.resolve('')
  }
}

/**
 * Initializes mermaid library with classic theme configuration
 */
const initMermaid = () => {
  if (typeof window !== 'undefined' && !isMermaidInitialized) {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        fontFamily: 'sans-serif',
        securityLevel: 'loose',
        flowchart: {
          htmlLabels: true,
          useMaxWidth: true,
          diagramPadding: 12,
          curve: 'linear',
          nodeSpacing: 60,
          rankSpacing: 80,
        },
        gantt: {
          titleTopMargin: 25,
          barHeight: 20,
          barGap: 4,
          topPadding: 50,
          leftPadding: 75,
          gridLineStartPadding: 35,
          fontSize: 11,
          numberSectionStyles: 4,
          axisFormat: '%Y-%m-%d',
        },
        maxTextSize: 50000,
        themeVariables: {
          background: '#ffffff',
          primaryColor: '#ffffff',
          primaryBorderColor: '#000000',
          primaryTextColor: '#000000',
          secondaryColor: '#ffffff',
          tertiaryColor: '#ffffff',
          fontFamily: 'sans-serif',
        },
      })
      isMermaidInitialized = true
      console.log('Mermaid initialized with classic theme')
      return true
    }
    catch (error) {
      console.error('Mermaid initialization error:', error)
      return false
    }
  }
  return isMermaidInitialized
}

const Flowchart = React.forwardRef((props: {
  PrimitiveCode: string
}, ref) => {
  const [svgCode, setSvgCode] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartId = useRef(`mermaid-chart-${Date.now()}-${Math.floor(Math.random() * 1000)}`).current
  const [isLoading, setIsLoading] = useState(true)
  const renderTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [errMsg, setErrMsg] = useState('')
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [isCodeComplete, setIsCodeComplete] = useState(false)
  const codeCompletionCheckRef = useRef<NodeJS.Timeout | undefined>(undefined)

  /**
   * Renders Mermaid chart
   */
  const renderMermaidChart = async (code: string) => {
    try {
      if (containerRef.current)
        containerRef.current.innerHTML = `<div id="${chartId}"></div>`

      await new Promise(resolve => setTimeout(resolve, 50))

      const { svg } = await mermaid.render(chartId, code)
      return svg
    }
 catch (error) {
      console.error('Mermaid render error:', error)
      throw error
    }
  }

  /**
   * Handle rendering errors
   */
  const handleRenderError = (error: any) => {
    console.error('Mermaid rendering error:', error)
    const errorMsg = (error as Error).message

    if (errorMsg.includes('getAttribute') || errorMsg.includes('DOM')) {
      // DOM 相关错误，重新初始化 mermaid
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'neutral',
          maxTextSize: 50000,
        })
        setErrMsg('图表渲染失败，正在重试...')

        // 延迟重试
        setTimeout(() => {
          setErrMsg('')
          setIsCodeComplete(true)
        }, 1000)
      }
 catch (e) {
        console.error('Mermaid re-initialization failed:', e)
        setErrMsg('渲染失败，请刷新页面重试')
      }
    }
 else {
      setErrMsg(`渲染图表失败: ${errorMsg}`)
    }

    setIsLoading(false)
  }

  /**
   * Renders flowchart based on provided code
   */
  const renderFlowchart = async (primitiveCode: string) => {
    if (!isInitialized || !containerRef.current) {
      setIsLoading(false)
      setErrMsg(!isInitialized ? 'Mermaid 初始化失败' : '容器元素未找到')
      return
    }

    // Don't render if code is not complete yet
    if (!isCodeComplete) {
      setIsLoading(true)
      return
    }

    setIsLoading(true)
    setErrMsg('')

    try {
      // 简化代码处理，直接使用原始代码
      const finalCode = primitiveCode.trim()

      // 渲染图表
      const svgGraph = await renderMermaidChart(finalCode)

      // 转换为 base64
      const base64Svg = await svgToBase64(svgGraph)

      if (base64Svg && typeof base64Svg === 'string')
        setSvgCode(base64Svg)

      setIsLoading(false)
    }
    catch (error) {
      // 错误处理
      handleRenderError(error)
    }
  }

  // Initialize mermaid
  useEffect(() => {
    const success = initMermaid()
    if (success)
      setIsInitialized(true)
  }, [])

  // Validate mermaid code and check for completeness
  useEffect(() => {
    if (codeCompletionCheckRef.current)
      clearTimeout(codeCompletionCheckRef.current)

    // Reset code complete status when code changes
    setIsCodeComplete(false)

    // If no code or code is extremely short, don't proceed
    if (!props.PrimitiveCode || props.PrimitiveCode.length < 10)
      return

    // Initial check
    const isComplete = isMermaidCodeComplete(props.PrimitiveCode)
    if (isComplete) {
      setIsCodeComplete(true)
      return
    }

    // Set a delay to check again in case code is still being generated
    codeCompletionCheckRef.current = setTimeout(() => {
      setIsCodeComplete(isMermaidCodeComplete(props.PrimitiveCode))
    }, 300)

    return () => {
      if (codeCompletionCheckRef.current)
        clearTimeout(codeCompletionCheckRef.current)
    }
  }, [props.PrimitiveCode])

  // 渲染效果处理
  useEffect(() => {
    if (isInitialized && isCodeComplete && props.PrimitiveCode) {
      if (renderTimeoutRef.current)
        clearTimeout(renderTimeoutRef.current)

      renderTimeoutRef.current = setTimeout(() => {
        renderFlowchart(props.PrimitiveCode)
      }, 300)
    }
 else {
      setIsLoading(true)
    }

    return () => {
      if (renderTimeoutRef.current)
        clearTimeout(renderTimeoutRef.current)
    }
  }, [props.PrimitiveCode, isInitialized, isCodeComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current)
        containerRef.current.innerHTML = ''

      if (renderTimeoutRef.current)
        clearTimeout(renderTimeoutRef.current)

      if (codeCompletionCheckRef.current)
        clearTimeout(codeCompletionCheckRef.current)
    }
  }, [])

  // Style classes
  const themeClasses = {
    container: cn('relative bg-white'),
    mermaidDiv: cn('mermaid relative h-auto w-full cursor-pointer bg-white'),
    errorMessage: cn('px-[26px] py-4 text-red-500'),
    errorIcon: cn('h-6 w-6 text-red-500'),
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={themeClasses.container}>
      <div ref={containerRef} style={{ position: 'absolute', visibility: 'hidden', height: 0, overflow: 'hidden' }} />

      {isLoading && !svgCode && (
        <div className='px-[26px] py-4'>
          <LoadingAnim type='text'/>
          {!isCodeComplete && (
            <div className="mt-2 text-sm text-gray-500">
              正在等待图表代码完成...
            </div>
          )}
        </div>
      )}

      {svgCode && (
        <div className={themeClasses.mermaidDiv} style={{ objectFit: 'cover' }} onClick={() => setImagePreviewUrl(svgCode)}>
          <img
            src={svgCode}
            alt="mermaid_chart"
            style={{ maxWidth: '100%' }}
            onError={() => { setErrMsg('图表渲染失败，请刷新重试') }}
          />
        </div>
      )}

      {errMsg && (
        <div className={themeClasses.errorMessage}>
          <div className="flex items-center">
            <ExclamationTriangleIcon className={themeClasses.errorIcon}/>
            <span className="ml-2">{errMsg}</span>
          </div>
        </div>
      )}

      {imagePreviewUrl && (
        <ImagePreview title='mermaid_chart' url={imagePreviewUrl} onCancel={() => setImagePreviewUrl('')} />
      )}
    </div>
  )
})

Flowchart.displayName = 'Flowchart'

export default Flowchart
