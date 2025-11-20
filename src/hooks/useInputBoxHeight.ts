import { useState, useEffect, useRef } from 'react'

/**
 * 输入框高度管理 Hook
 * 负责动态计算和管理输入框的高度变化
 */
export function useInputBoxHeight(inputBoxRef: React.RefObject<HTMLDivElement>) {
  const [inputBoxHeight, setInputBoxHeight] = useState<number>(120) // 默认高度

  // 手动更新高度的函数
  const updateInputBoxHeight = () => {
    if (inputBoxRef.current) {
      const height = inputBoxRef.current.offsetHeight
      setInputBoxHeight(height)
    }
  }

  useEffect(() => {
    // 延迟初始计算，确保DOM已渲染
    const timer = setTimeout(() => {
      updateInputBoxHeight()
    }, 100)

    // 监听窗口大小变化
    const handleResize = () => {
      updateInputBoxHeight()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 设置观察器来监听输入框高度变化
  useEffect(() => {
    const setupObservers = () => {
      if (!inputBoxRef.current) {
        // 如果ref还没有设置，延迟重试
        setTimeout(setupObservers, 100)
        return
      }

      // 立即更新一次
      updateInputBoxHeight()

      // 监听输入框内容变化（使用ResizeObserver）
      let resizeObserver: ResizeObserver | null = null
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            // 使用 borderBoxSize 获取包含边框和padding的完整高度
            const height = entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height + 32
            console.log('ResizeObserver检测到高度变化:', height) // 调试日志
            setInputBoxHeight(height)
          }
        })
        resizeObserver.observe(inputBoxRef.current)
      }

      // 监听DOM变化（使用MutationObserver）
      let mutationObserver: MutationObserver | null = null
      if (window.MutationObserver) {
        mutationObserver = new MutationObserver(() => {
          // 延迟一点执行，确保DOM更新完成
          setTimeout(updateInputBoxHeight, 50)
        })
        mutationObserver.observe(inputBoxRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class'],
        })
      }

      // 返回清理函数
      return () => {
        if (resizeObserver) {
          resizeObserver.disconnect()
        }
        if (mutationObserver) {
          mutationObserver.disconnect()
        }
      }
    }

    const cleanup = setupObservers()
    return cleanup
  }, []) // 空依赖数组，但内部会重试直到ref可用

  return {
    inputBoxHeight,
    updateInputBoxHeight,
  }
}