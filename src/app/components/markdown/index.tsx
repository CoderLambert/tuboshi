'use client'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import ReactMarkdown from 'react-markdown'

const Flowchart = dynamic(() => import('@/app/components/base/mermaid'), { ssr: false })

import RemarkMath from 'remark-math'
import RemarkBreaks from 'remark-breaks'
import RemarkGfm from 'remark-gfm'
import RehypeRaw from 'rehype-raw'
// import SyntaxHighlighter from 'react-syntax-highlighter'
import {
  atelierHeathLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Component, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flow } from 'lodash-es'
import ActionButton from '@/app/components/base/action-button'
import CopyIcon from '@/app/components/base/copy-icon'
import SVGBtn from '@/app/components/base/svg'
// import Flowchart from '@/app/components/base/mermaid'
import ImageGallery from '@/app/components/base/image-gallery'
// import { useChatContext } from '@/app/components/base/chat/chat/context'
import VideoGallery from '@/app/components/base/video-gallery'
import AudioGallery from '@/app/components/base/audio-gallery'
import MarkdownButton from '@/app/components/base/markdown-blocks/button'
import MarkdownForm from '@/app/components/base/markdown-blocks/form'
import ThinkBlock from '@/app/components/base/markdown-blocks/think-block'
import OrderDetail from '@/app/components/base/markdown-blocks/orderDetail'
import cn from '@/utils/classnames'
import SVGRenderer from '@/app/components/base/svg-gallery'
import ArrowUpIcon from '@/assets/icons/arrow-up.svg'
import ArrowDownIcon from '@/assets/icons/arrow-down.svg'
const SyntaxHighlighter = dynamic(() => import('react-syntax-highlighter'), { ssr: false })

// Available language https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_LANGUAGES_HLJS.MD
const capitalizationLanguageNameMap: Record<string, string> = {
  sql: 'SQL',
  javascript: 'JavaScript',
  java: 'Java',
  typescript: 'TypeScript',
  vbscript: 'VBScript',
  css: 'CSS',
  html: 'HTML',
  xml: 'XML',
  php: 'PHP',
  python: 'Python',
  yaml: 'Yaml',
  mermaid: 'Mermaid',
  markdown: 'MarkDown',
  makefile: 'MakeFile',
  echarts: 'ECharts',
  shell: 'Shell',
  powershell: 'PowerShell',
  json: 'JSON',
  latex: 'Latex',
  svg: 'SVG',
  abc: 'ABC',
}
const getCorrectCapitalizationLanguageName = (language: string) => {
  if (!language) { return 'Plain' }

  if (language in capitalizationLanguageNameMap) { return capitalizationLanguageNameMap[language] }

  return language.charAt(0).toUpperCase() + language.substring(1)
}

const preprocessLaTeX = (content: string) => {
  if (typeof content !== 'string') { return content }

  const codeBlockRegex = /```[\s\S]*?```/g
  const codeBlocks = content.match(codeBlockRegex) || []
  let processedContent = content.replace(codeBlockRegex, 'CODE_BLOCK_PLACEHOLDER')

  processedContent = flow([
    (str: string) => str.replace(/\\\[(.*?)\\\]/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/\\\[(.*?)\\\]/gs, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/\\\((.*?)\\\)/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/(^|[^\\])\$(.+?)\$/g, (_, prefix, equation) => `${prefix}$${equation}$`),
  ])(processedContent)

  codeBlocks.forEach((block) => {
    processedContent = processedContent.replace('CODE_BLOCK_PLACEHOLDER', block)
  })

  return processedContent
}

const preprocessThinkTag = (content: string) => {
  const thinkOpenTagRegex = /<think>\n/g
  const thinkCloseTagRegex = /\n<\/think>/g
  return flow([
    (str: string) => str.replace(thinkOpenTagRegex, '<details data-think=true>\n'),
    (str: string) => str.replace(thinkCloseTagRegex, '\n[ENDTHINKFLAG]</details>'),
  ])(content)
}

const getOrderDetailInitialExpanded = (attrs: string) => {
  const showDetailMatch = attrs.match(/\bdata-showdetail\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
  const showDetailValue = showDetailMatch?.[1] ?? showDetailMatch?.[2] ?? showDetailMatch?.[3]
  return showDetailValue === 'true'
}

const getOrderDetailIndex = (orderProps: any) => {
  const properties = orderProps.node?.properties || {}
  const index = properties.dataOrderdetailIndex
    ?? properties.dataOrderDetailIndex
    ?? properties.dataorderdetailindex
    ?? properties['data-orderdetail-index']
  return Number(index)
}

const preprocessOrderDetailTag = (content: string) => {
  // 匹配完整的 <orderDetail ...>...</orderDetail> 块（大小写不敏感）
  // 1. 将多行属性压成单行
  // 2. 前后加空行，确保 Markdown 解析器将其识别为 HTML 块而非普通文本
  // 3. 根据 orderdetail 个数，在第一个 orderdetail 前插入展开/收起全部按钮占位标签
  const orderDetailRegex = /<orderdetail([\s\S]*?)>([\s\S]*?)<\/orderdetail\s*>/gi
  const orderDetailCount = content.match(orderDetailRegex)?.length || 0
  const initialExpandedList: boolean[] = []
  let currentOrderDetailIndex = 0
  const processedContent = content.replace(
    orderDetailRegex,
    (_, attrs, inner) => {
      currentOrderDetailIndex++
      const flatAttrs = attrs.replace(/\s+/g, ' ').trim()
      initialExpandedList.push(getOrderDetailInitialExpanded(flatAttrs))
      const orderDetailIndexAttr = `data-orderdetail-index="${currentOrderDetailIndex - 1}"`
      const openTag = flatAttrs
        ? `<orderdetail ${flatAttrs} ${orderDetailIndexAttr}>`
        : `<orderdetail ${orderDetailIndexAttr}>`
      const togglePlaceholder = orderDetailCount > 1 && currentOrderDetailIndex === 1
        ? '\n\n<orderdetailtoggle></orderdetailtoggle>\n\n'
        : ''
      return `${togglePlaceholder}\n\n${openTag}${inner.trim()}</orderdetail>\n\n`
    },
  )
  return { content: processedContent, count: orderDetailCount, initialExpandedList }
}

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null)

  return (
    <pre ref={ref}>
      <span
        className="copy-code-button"
      ></span>
      {props.children}
    </pre>
  )
}

// **Add code block
// Avoid error #185 (Maximum update depth exceeded.
// This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
// React limits the number of nested updates to prevent infinite loops.)
// Reference A: https://reactjs.org/docs/error-decoder.html?invariant=185
// Reference B1: https://react.dev/reference/react/memo
// Reference B2: https://react.dev/reference/react/useMemo
// ****
// The original error that occurred in the streaming response during the conversation:
// Error: Minified React error 185;
// visit https://reactjs.org/docs/error-decoder.html?invariant=185 for the full message
// or use the non-minified dev environment for full errors and additional helpful warnings.

const CodeBlock: any = memo(({ inline, className, children = '', ...props }: any) => {
  const [isSVG, setIsSVG] = useState(true)
  const match = /language-(\w+)/.exec(className || '')
  const language = match && match[1]
  const languageShowName = getCorrectCapitalizationLanguageName(language || '')
  const chartData = useMemo(() => {
    const str = String(children).replace(/\n$/, '')
    if (language === 'echarts') {
      try {
        return JSON.parse(str)
      }
      catch { }
      try {
        // eslint-disable-next-line no-new-func, sonarjs/code-eval
        return new Function(`return ${str}`)()
      }
      catch { }
    }
    return JSON.parse('{"title":{"text":"ECharts error - Wrong option."}}')
  }, [language, children])

  const renderCodeContent = useMemo(() => {
    const content = String(children).replace(/\n$/, '')
    switch (language) {
      case 'mermaid':
        if (isSVG) { return <Flowchart PrimitiveCode={content} /> }
        break
      // case 'echarts':
      //   return (
      //     <div style={{ minHeight: '350px', minWidth: '100%', overflowX: 'scroll' }}>
      //       <ErrorBoundary>
      //         <ReactEcharts option={chartData} style={{ minWidth: '700px' }} />
      //       </ErrorBoundary>
      //     </div>
      //   )
      case 'svg':
        if (isSVG) {
          return (
            <ErrorBoundary>
              <SVGRenderer content={content} />
            </ErrorBoundary>
          )
        }
        break

      default:
        return (
          <SyntaxHighlighter
            {...props}
            style={atelierHeathLight}
            customStyle={{
              paddingLeft: 12,
              borderBottomLeftRadius: '10px',
              borderBottomRightRadius: '10px',
              backgroundColor: 'var(--color-components-input-bg-normal)',
            }}
            language={match && match[1]}
            showLineNumbers
            PreTag="div"
          >
            {content}
          </SyntaxHighlighter>
        )
    }
  }, [children, language, isSVG, chartData, props, match])

  if (inline || !match) { return <code {...props} className={className}>{children}</code> }

  return (
    <div className='relative'>
      <div className='flex h-8 items-center justify-between rounded-t-[10px] border-b border-divider-subtle bg-components-input-bg-normal p-1 pl-3'>
        <div className='system-xs-semibold-uppercase text-text-secondary'>{languageShowName}</div>
        <div className='flex items-center gap-1'>
          {(['mermaid', 'svg']).includes(language!) && <SVGBtn isSVG={isSVG} setIsSVG={setIsSVG} />}
          <ActionButton>
            <CopyIcon content={String(children).replace(/\n$/, '')} />
          </ActionButton>
        </div>
      </div>
      {renderCodeContent}
    </div>
  )
})
CodeBlock.displayName = 'CodeBlock'

const VideoBlock: any = memo(({ node }: any) => {
  const srcs = node.children.filter((child: any) => 'properties' in child).map((child: any) => {
    const props = child as any
    return props.properties && props.properties.src
  }).filter(Boolean)
  if (srcs.length === 0) { return null }
  return <VideoGallery key={srcs.join()} srcs={srcs} />
})
VideoBlock.displayName = 'VideoBlock'

const AudioBlock: any = memo(({ node }: any) => {
  const srcs = node.children.filter((child: any) => 'properties' in child).map((child: any) => {
    const props = child as any
    return props.properties && props.properties.src
  }).filter(Boolean)
  if (srcs.length === 0) { return null }
  return <AudioGallery key={srcs.join()} srcs={srcs} />
})
AudioBlock.displayName = 'AudioBlock'

const ScriptBlock = memo(({ node }: any) => {
  const scriptContent = node.children[0]?.value || ''
  return `<script>${scriptContent}</script>`
})
ScriptBlock.displayName = 'ScriptBlock'

const Paragraph = (paragraph: any) => {
  const { node }: any = paragraph
  const children_node = node.children
  if (children_node && children_node[0] && 'tagName' in children_node[0] && children_node[0].tagName === 'img') {
    return (
      <div className="markdown-img-wrapper">
        <ImageGallery srcs={[children_node[0].properties.src]} />
        {
          Array.isArray(paragraph.children) && paragraph.children.length > 1 && (
            <div className="mt-2">{paragraph.children.slice(1)}</div>
          )
        }
      </div>
    )
  }
  return <p>{paragraph.children}</p>
}

const Img = ({ src }: any) => {
  return <div suppressHydrationWarning={true} className="markdown-img-wrapper"><ImageGallery srcs={[src]} /></div>
}

const Link = ({ node, children, ...props }: any) => {
  if (node.properties?.href && node.properties.href?.toString().startsWith('abbr')) {
    // Todo: useChatContext
    // const { onSend } = useChatContext()
    const hidden_text = decodeURIComponent(node.properties.href.toString().split('abbr:')[1])

    return <abbr className="!decoration-primary-700 cursor-pointer underline decoration-dashed" title={node.children[0]?.value || ''}>{node.children[0]?.value || ''}</abbr>
  }
  else {
    return <a {...props} target="_blank" className="!decoration-primary-700 cursor-pointer underline decoration-dashed">{children || 'Download'}</a>
  }
}

export function Markdown(props: { content: string; className?: string; customDisallowedElements?: string[] }) {
  // 预处理 Markdown 内容，根据 orderdetail 数量插入展开/收起全部按钮
  const processedOrderDetail = useMemo(() => {
    const contentWithThinkTag = preprocessThinkTag(props.content)
    const orderDetailResult = preprocessOrderDetailTag(contentWithThinkTag)
    return {
      ...orderDetailResult,
      content: preprocessLaTeX(orderDetailResult.content),
    }
  }, [props.content])
  const processedContent = processedOrderDetail.content

  // 全局展开/收起状态管理
  const { t } = useTranslation()
  const [orderDetailExpandedMap, setOrderDetailExpandedMap] = useState<Record<number, boolean>>({})
  const needsMath = processedContent.includes('$$')
  const [katexPlugin, setKatexPlugin] = useState<any>(null)

  useEffect(() => {
    if (!needsMath || katexPlugin)
      return
    let cancelled = false
    Promise.all([
      import('rehype-katex'),
      import('katex/dist/katex.min.css'),
    ]).then(([mod]) => {
      if (!cancelled)
        setKatexPlugin(() => mod.default)
    }).catch((error) => {
      console.error('Failed to load KaTeX', error)
    })
    return () => {
      cancelled = true
    }
  }, [needsMath, katexPlugin])

  useEffect(() => {
    setOrderDetailExpandedMap({})
  }, [props.content])

  const isAllOrderDetailExpanded = processedOrderDetail.count > 1
    && processedOrderDetail.initialExpandedList.every((initialExpanded, index) => orderDetailExpandedMap[index] ?? initialExpanded)

  const handleGlobalExpandedToggle = () => {
    const nextExpanded = !isAllOrderDetailExpanded
    setOrderDetailExpandedMap(
      Object.fromEntries(processedOrderDetail.initialExpandedList.map((_, index) => [index, nextExpanded])),
    )
  }

  const handleOrderDetailExpandedChange = useCallback((index: number, expanded: boolean) => {
    if (!Number.isInteger(index)) {
      return
    }
    setOrderDetailExpandedMap((prev) => {
      if (prev[index] === expanded) {
        return prev
      }
      return { ...prev, [index]: expanded }
    })
  }, [])

  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(props.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // 2秒后重置状态
    })
  }

  return (
    <div className={cn('markdown-body relative', '!text-text-primary', props.className)}>
      <ReactMarkdown
        remarkPlugins={[
          RemarkGfm,
          [RemarkMath, { singleDollarTextMath: false }],
          RemarkBreaks,
        ]}
        rehypePlugins={[
          ...(katexPlugin ? [katexPlugin] : []),
          RehypeRaw as any,
          // The Rehype plug-in is used to remove the ref attribute of an element
          () => {
            return (tree) => {
              const iterate = (node: any) => {
                if (node.type === 'element' && node.properties?.ref) { delete node.properties.ref }

                if (node.type === 'element' && !/^[a-z][a-z0-9]*$/i.test(node.tagName)) {
                  node.type = 'text'
                  node.value = `<${node.tagName}`
                }

                if (node.children) { node.children.forEach(iterate) }
              }
              tree.children.forEach(iterate)
            }
          },
        ]}
        disallowedElements={['iframe', 'head', 'html', 'meta', 'link', 'style', 'body', ...(props.customDisallowedElements || [])]}
        components={{
          code: CodeBlock,
          img: Img,
          video: VideoBlock,
          audio: AudioBlock,
          a: Link,
          p: Paragraph,
          button: MarkdownButton,
          form: MarkdownForm,
          script: ScriptBlock as any,
          details: ThinkBlock,
          ...({
            orderdetailtoggle: () => (
              <button
                className="mb-[24px] flex w-full items-center justify-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-600"
                onClick={handleGlobalExpandedToggle}
              >
                {isAllOrderDetailExpanded ? t('收起') : t('展开')}
                <Image
                  src={isAllOrderDetailExpanded ? ArrowUpIcon : ArrowDownIcon}
                  alt="Arrow"
                  className='w-[24px] h-[24px]'
                />
              </button>
            ),
            orderdetail: (orderProps: any) => {
              const currentOrderDetailIndex = getOrderDetailIndex(orderProps)
              const isValidOrderDetailIndex = Number.isInteger(currentOrderDetailIndex)
                && currentOrderDetailIndex >= 0
                && currentOrderDetailIndex < processedOrderDetail.count
              const expanded = isValidOrderDetailIndex
                ? orderDetailExpandedMap[currentOrderDetailIndex] ?? processedOrderDetail.initialExpandedList[currentOrderDetailIndex]
                : false
              return (
                <OrderDetail
                  {...orderProps}
                  expanded={expanded}
                  orderDetailIndex={currentOrderDetailIndex}
                  onExpandedChange={handleOrderDetailExpandedChange}
                />
              )
            },
          } as any),
        }}
      >
        {/* Markdown detect has problem. */}
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}

// **Add an ECharts runtime error handler
// Avoid error #7832 (Crash when ECharts accesses undefined objects)
// This can happen when a component attempts to access an undefined object· that references an unregistered map, causing the program to crash.

export default class ErrorBoundary extends Component {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ hasError: true })
    console.error(error, errorInfo)
  }

  render() {
    // @ts-expect-error
    if (this.state.hasError) { return <div>Oops! An error occurred. This could be due to an ECharts runtime error or invalid SVG content. <br />(see the browser console for more information)</div> }

    // @ts-expect-error
    return this.props.children
  }
}
