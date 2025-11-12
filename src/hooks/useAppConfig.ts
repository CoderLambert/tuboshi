import { useState, useEffect, useRef } from 'react'
import { getAppKey, getAppId, getApiUrl } from '@/config'

/**
 * 应用配置管理 Hook
 * 负责加载和管理应用的基础配置信息
 */
export interface AppConfig {
  apiKey?: string
  appId?: string
  apiUrl?: string
  isLoading: boolean
  hasError: boolean
  error?: Error
}

export function useAppConfig(): AppConfig {
  const [config, setConfig] = useState<AppConfig>({
    apiKey: undefined,
    appId: undefined,
    apiUrl: undefined,
    isLoading: true,
    hasError: false,
  })

  const hasSetAppConfig = useRef(false)

  useEffect(() => {
    let isMounted = true

    const loadConfig = async () => {
      try {
        const [key, id, url] = await Promise.all([
          getAppKey(),
          getAppId(),
          getApiUrl()
        ])

        if (!isMounted) return

        setConfig({
          apiKey: key,
          appId: id,
          apiUrl: url,
          isLoading: false,
          hasError: false,
        })

        hasSetAppConfig.current = true

        console.log('=========== loadConfig start========')
        console.log('apiKey', key)
        console.log('appId', id)
        console.log('apiUrl', url)
        console.log('=========== loadConfig end ========')
      } catch (error) {
        if (!isMounted) return

        console.error('Failed to load app config:', error)

        setConfig(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          error: error instanceof Error ? error : new Error('Failed to load config'),
        }))
      }
    }

    loadConfig()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    ...config,
    hasSetAppConfig: hasSetAppConfig.current,
  }
}