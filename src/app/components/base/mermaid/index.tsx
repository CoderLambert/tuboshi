import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useTranslation } from 'react-i18next'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import {
  cleanUpSvgCode,
  isMermaidCodeComplete,
  prepareMermaidCode,
  processSvgForTheme,
  svgToBase64,
  waitForDOMElement,
} from './utils'
import LoadingAnim from '@/app/components/base/chat/chat/loading-anim'
import cn from '@/utils/classnames'
import ImagePreview from '@/app/components/base/image-uploader/image-preview'
import { Theme } from '@/types/app'


// Global flags and cache for mermaid
let isMermaidInitialized = false
const diagramCache = new Map<string, string>()
let mermaidAPI: any = null

if (typeof window !== 'undefined')
  mermaidAPI = mermaid.mermaidAPI

// Only light theme configuration
const THEME = {
  name: 'Light Theme',
  background: '#ffffff',
  primaryColor: '#ffffff',
  primaryBorderColor: '#000000',
  primaryTextColor: '#000000',
  secondaryColor: '#ffffff',
  tertiaryColor: '#ffffff',
  nodeColors: [
    { bg: '#f0f9ff', color: '#0369a1' },
    { bg: '#f0fdf4', color: '#166534' },
    { bg: '#fef2f2', color: '#b91c1c' },
    { bg: '#faf5ff', color: '#7e22ce' },
    { bg: '#fffbeb', color: '#b45309' },
  ],
  connectionColor: '#74a0e0',
}

/**
 * Initializes mermaid library with default configuration
 */
const initMermaid = () => {
  if (typeof window !== 'undefined' && !isMermaidInitialized) {
    try {
      mermaid.initialize({
        startOnLoad: false,
        fontFamily: 'sans-serif',
        securityLevel: 'loose',
        flowchart: {
          htmlLabels: true,
          useMaxWidth: true,
          diagramPadding: 10,
          curve: 'basis',
          nodeSpacing: 50,
          rankSpacing: 70,
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
      })
      isMermaidInitialized = true
    }
    catch (error) {
      console.error('Mermaid initialization error:', error)
      return null
    }
  }
  return isMermaidInitialized
}

const Flowchart = React.forwardRef((props: {
  PrimitiveCode: string
}, ref) => {
  const { t, i18n  } = useTranslation()
  console.log('Mermaid - Current language:', i18n.language);
  console.log('Mermaid - Translation for app.mermaid.classic:', t('app.mermaid.classic'));
  console.log('Mermaid - Translation for app.theme.switchLight:', t('app.theme.switchLight'));
  const [svgCode, setSvgCode] = useState<string | null>(null)
  const [look, setLook] = useState<'classic' | 'handDrawn'>('classic')
  const [isInitialized, setIsInitialized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartId = useRef(`mermaid-chart-${Math.random().toString(36).substr(2, 9)}`).current
  const [isLoading, setIsLoading] = useState(true)
  const renderTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [errMsg, setErrMsg] = useState('')
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [isCodeComplete, setIsCodeComplete] = useState(false)
  const codeCompletionCheckRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Create cache key from code and style (theme removed)
  const cacheKey = useMemo(() => {
    return `${props.PrimitiveCode}-${look}`
  }, [props.PrimitiveCode, look])

  /**
   * Renders Mermaid chart
   */
  const renderMermaidChart = async (code: string, style: 'classic' | 'handDrawn') => {
    if (style === 'handDrawn') {
      // Special handling for hand-drawn style
      if (containerRef.current)
        containerRef.current.innerHTML = `<div id="${chartId}"></div>`
      await new Promise(resolve => setTimeout(resolve, 30))

      if (typeof window !== 'undefined' && mermaidAPI) {
        // Prefer using mermaidAPI directly for hand-drawn style
        return await mermaidAPI.render(chartId, code)
      }
      else {
        // Fall back to standard rendering if mermaidAPI is not available
        const { svg } = await mermaid.render(chartId, code)
        return { svg }
      }
    }
    else {
      // Standard rendering for classic style - using the extracted waitForDOMElement function
      const renderWithRetry = async () => {
        if (containerRef.current)
          containerRef.current.innerHTML = `<div id="${chartId}"></div>`
        await new Promise(resolve => setTimeout(resolve, 30))
        const { svg } = await mermaid.render(chartId, code)
        return { svg }
      }
      return await waitForDOMElement(renderWithRetry)
    }
  }

  /**
   * Handle rendering errors
   */
  const handleRenderError = (error: any) => {
    console.error('Mermaid rendering error:', error)
    const errorMsg = (error as Error).message

    if (errorMsg.includes('getAttribute')) {
      diagramCache.clear()
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
      })
    }
    else {
      setErrMsg(`Rendering chart failed, please refresh and try again ${look === 'handDrawn' ? 'Or try using classic mode' : ''}`)
    }

    if (look === 'handDrawn') {
      try {
        // Clear possible cache issues
        diagramCache.delete(`${props.PrimitiveCode}-handDrawn`)

        // Reset mermaid configuration
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'default',
          maxTextSize: 50000,
        })

        // Try rendering with standard mode
        setLook('classic')
        setErrMsg('Hand-drawn mode is not supported for this diagram. Switched to classic mode.')

        // Delay error clearing
        setTimeout(() => {
          if (containerRef.current) {
            // Try rendering again with standard mode, but can't call renderFlowchart directly due to circular dependency
            // Instead set state to trigger re-render
            setIsCodeComplete(true) // This will trigger useEffect re-render
          }
        }, 500)
      }
      catch (e) {
        console.error('Reset after handDrawn error failed:', e)
      }
    }

    setIsLoading(false)
  }

  // Initialize mermaid
  useEffect(() => {
    const api = initMermaid()
    if (api)
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

    // Check if code already in cache - if so we know it's valid
    if (diagramCache.has(cacheKey)) {
      setIsCodeComplete(true)
      return
    }

    // Initial check using the extracted isMermaidCodeComplete function
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
  }, [props.PrimitiveCode, cacheKey])

  /**
   * Renders flowchart based on provided code
   */
  const renderFlowchart = useCallback(async (primitiveCode: string) => {
    if (!isInitialized || !containerRef.current) {
      setIsLoading(false)
      setErrMsg(!isInitialized ? 'Mermaid initialization failed' : 'Container element not found')
      return
    }

    // Don't render if code is not complete yet
    if (!isCodeComplete) {
      setIsLoading(true)
      return
    }

    // Return cached result if available
    if (diagramCache.has(cacheKey)) {
      setSvgCode(diagramCache.get(cacheKey) || null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setErrMsg('')

    try {
      let finalCode: string

      // Check if it's a gantt chart
      const isGanttChart = primitiveCode.trim().startsWith('gantt')

      if (isGanttChart) {
        // For gantt charts, ensure each task is on its own line
        // and preserve exact whitespace/format
        finalCode = primitiveCode.trim()
      }
      else {
        // Step 1: Clean and prepare Mermaid code using the extracted prepareMermaidCode function
        finalCode = prepareMermaidCode(primitiveCode, look)
      }

      // Step 2: Render chart
      const svgGraph = await renderMermaidChart(finalCode, look)

      // Step 3: Apply theme to SVG using the extracted processSvgForTheme function
      // Always use light theme
      const processedSvg = processSvgForTheme(
        svgGraph.svg,
        false, // Always false for light theme
        look === 'handDrawn',
        THEME, // Only provide light theme
      )

      // Step 4: Clean SVG code and convert to base64 using the extracted functions
      const cleanedSvg = cleanUpSvgCode(processedSvg)
      const base64Svg = await svgToBase64(cleanedSvg)

      if (base64Svg && typeof base64Svg === 'string') {
        diagramCache.set(cacheKey, base64Svg)
        setSvgCode(base64Svg)
      }

      setIsLoading(false)
    }
    catch (error) {
      // Error handling
      handleRenderError(error)
    }
  }, [chartId, isInitialized, cacheKey, isCodeComplete, look])

  /**
   * Configure mermaid based on selected style
   */
  const configureMermaid = useCallback(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      const config: any = {
        startOnLoad: false,
        securityLevel: 'loose',
        fontFamily: 'sans-serif',
        maxTextSize: 50000,
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
      }

      if (look === 'classic') {
        config.theme = 'neutral' // Always use neutral theme
        config.flowchart = {
          htmlLabels: true,
          useMaxWidth: true,
          diagramPadding: 12,
          nodeSpacing: 60,
          rankSpacing: 80,
          curve: 'linear',
          ranker: 'tight-tree',
        }
      }
      else {
        config.theme = 'default'
        config.themeCSS = `
          .node rect { fill-opacity: 0.85; }
          .edgePath .path { stroke-width: 1.5px; }
          .label { font-family: 'sans-serif'; }
          .edgeLabel { font-family: 'sans-serif'; }
          .cluster rect { rx: 5px; ry: 5px; }
        `
        config.themeVariables = {
          fontSize: '14px',
          fontFamily: 'sans-serif',
        }
        config.flowchart = {
          htmlLabels: true,
          useMaxWidth: true,
          diagramPadding: 10,
          nodeSpacing: 40,
          rankSpacing: 60,
          curve: 'basis',
        }
        config.themeVariables.primaryBorderColor = THEME.connectionColor
      }

      // Theme variables for light theme
      config.themeVariables = {
        background: THEME.background,
        primaryColor: THEME.primaryColor,
        primaryBorderColor: THEME.primaryBorderColor,
        primaryTextColor: THEME.primaryTextColor,
        secondaryColor: THEME.secondaryColor,
        tertiaryColor: THEME.tertiaryColor,
        fontFamily: 'sans-serif',
      }

      try {
        mermaid.initialize(config)
        return true
      }
      catch (error) {
        console.error('Config error:', error)
        return false
      }
    }
    return false
  }, [isInitialized, look])

  // Effect for style configuration
  useEffect(() => {
    if (diagramCache.has(cacheKey)) {
      setSvgCode(diagramCache.get(cacheKey) || null)
      setIsLoading(false)
      return
    }

    if (configureMermaid() && containerRef.current && isCodeComplete)
      renderFlowchart(props.PrimitiveCode)
  }, [look, props.PrimitiveCode, renderFlowchart, isInitialized, cacheKey, isCodeComplete, configureMermaid])

  // Effect for rendering with debounce
  useEffect(() => {
    if (diagramCache.has(cacheKey)) {
      setSvgCode(diagramCache.get(cacheKey) || null)
      setIsLoading(false)
      return
    }

    if (renderTimeoutRef.current)
      clearTimeout(renderTimeoutRef.current)

    if (isCodeComplete) {
      renderTimeoutRef.current = setTimeout(() => {
        if (isInitialized)
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
  }, [props.PrimitiveCode, renderFlowchart, isInitialized, cacheKey, isCodeComplete])

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

  // Style classes for theme-dependent elements (simplified for light theme only)
  const themeClasses = {
    container: cn('relative bg-white'),
    mermaidDiv: cn('mermaid relative h-auto w-full cursor-pointer bg-white'),
    errorMessage: cn('px-[26px] py-4 text-red-500'),
    errorIcon: cn('h-6 w-6 text-red-500'),
    segmented: cn('msh-segmented msh-segmented-sm css-23bs09 css-var-r1 text-gray-700'),
    themeToggle: cn('flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-300 bg-white/80 hover:bg-white hover:shadow-lg text-gray-700 border border-gray-200'),
  }

  // Style classes for look options
  const getLookButtonClass = (lookType: 'classic' | 'handDrawn') => {
    return cn(
      'system-sm-medium mb-4 flex h-8 w-[calc((100%-8px)/2)] cursor-pointer items-center justify-center rounded-lg border border-components-option-card-option-border bg-components-option-card-option-bg text-text-secondary',
      look === lookType && 'border-[1.5px] border-components-option-card-option-selected-border bg-components-option-card-option-selected-bg text-text-primary',
    )
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={themeClasses.container}>
      <div className={themeClasses.segmented}>
        <div className="msh-segmented-group">
          <label className="msh-segmented-item m-2 flex w-[200px] items-center space-x-1">
            <div
              key='classic'
              className={getLookButtonClass('classic')}
              onClick={() => setLook('classic')}
            >
              <div className="msh-segmented-item-label">{t('app.mermaid.classic')}</div>
            </div>
            <div
              key='handDrawn'
              className={getLookButtonClass('handDrawn')}
              onClick={() => setLook('handDrawn')}
            >
              <div className="msh-segmented-item-label">{t('app.mermaid.handDrawn')}</div>
            </div>
          </label>
        </div>
      </div>

      <div ref={containerRef} style={{ position: 'absolute', visibility: 'hidden', height: 0, overflow: 'hidden' }} />

      {isLoading && !svgCode && (
        <div className='px-[26px] py-4'>
          <LoadingAnim type='text'/>
          {!isCodeComplete && (
            <div className="mt-2 text-sm text-gray-500">
              {t('common.wait_for_completion', 'Waiting for diagram code to complete...')}
            </div>
          )}
        </div>
      )}

      {svgCode && (
        <div className={themeClasses.mermaidDiv} style={{ objectFit: 'cover' }} onClick={() => setImagePreviewUrl(svgCode)}>
          <div className="absolute bottom-2 left-2 z-[100]">
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Theme toggle removed as we only have light theme
              }}
              className={themeClasses.themeToggle}
              title={t('app.theme.switchLight') || ''}
              style={{ transform: 'translate3d(0, 0, 0)' }}
            >
              <SunIcon className="h-5 w-5" />
            </button>
          </div>

          <img
            src={svgCode}
            alt="mermaid_chart"
            style={{ maxWidth: '100%' }}
            onError={() => { setErrMsg('Chart rendering failed, please refresh and retry') }}
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