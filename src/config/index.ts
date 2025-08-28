import type { AppInfo } from '@/types/app'
import useAppStore from '@/hooks/useAppStore'
// export const API_KEY = 'app-Bw7GY5U1f7d4XIxXxWRuHueC'
// export const APP_ID = 'a486b436-4997-4331-b6ec-a78d6f47122c'
// export const API_URL = 'http://10.21.61.78:31092/v1'

export const API_KEY = 'app-OzDb7ZrJKLPQ8rYpYTq5ZZg9'
export const APP_ID = 'c4acfcf5-ff94-49f2-9c6b-c78f04f03e2b'
export const API_URL = 'https://ai-agent.jtexpress.ph/v1'

// const store = useAppStore.getState()

type AppConfigStore = {
  app_key: string
  app_id: string
  api_url: string
}

export const getAppKey = () => {
  const store = useAppStore.getState() as AppConfigStore
  console.log('getApiKey', store.app_key)
  return store.app_key || API_KEY
}

export const getAppId = () => {
  const store = useAppStore.getState() as AppConfigStore
  console.log('getAppId', store.app_id)
  return store.app_id || APP_ID
}

export const getApiUrl = () => {
  const store = useAppStore.getState() as AppConfigStore
  console.log('getApiUrl', store.api_url)
  return store.api_url || API_URL
}

// console.log('store', store)
// export const API_KEY = store.app_key
// export const APP_ID = store.app_id
// export const API_URL = store.api_url

// console.log('store.app_key', store.app_key)
// console.log('store.app_id', store.app_id)
// console.log('store.api_url', store.api_url)
// console.log('API_URL', API_URL)
// export const TEST_API_KEY = store.app_key
// export const TEST_APP_ID = store.app_id
// export const TEST_API_URL = store.api_url
// console.log('TEST_API_KEY', TEST_API_KEY)
// console.log('TEST_APP_ID', TEST_APP_ID)
// console.log('TEST_API_URL', TEST_API_URL)
// app_key:  app-b9TjpM58FhCOuWUPhCGzAydW

// app_id: 9f47d0e7-93f5-45c9-9e50-8b411ab421bf

// api_url: https://ai-agent.jtexpress.ph/v1

// 大模型平台 App 信息配置， 需要 jsBridge 返回
export const APP_INFO: AppInfo = {
  title: 'Chat APP',
  description: '',
  copyright: '',
  privacy_policy: '',
  default_language: 'en',
}

export const isShowPrompt = false
export const promptTemplate = 'I want you to act as a javascript console.'

export const API_PREFIX = '/api'

export const LOCALE_COOKIE_NAME = 'locale'
export const USERID_COOKIE_NAME = 'user_id'
export const DEFAULT_VALUE_MAX_LEN = 48
