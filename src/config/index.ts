import type { AppInfo } from '@/types/app'
import { getGPTConfig } from '@/lib/jsBridge'
// export const API_KEY = 'app-Bw7GY5U1f7d4XIxXxWRuHueC'
// export const APP_ID = 'a486b436-4997-4331-b6ec-a78d6f47122c'
// export const API_URL = 'http://10.21.61.78:31092/v1'

export const API_KEY = 'app-OzDb7ZrJKLPQ8rYpYTq5ZZg9'
export const APP_ID = 'c4acfcf5-ff94-49f2-9c6b-c78f04f03e2b'
export const API_URL = 'https://ai-agent.jtexpress.ph/v1'

export const getGptConfig = async () => {
  const res = await getGPTConfig()
  console.log('getGptConfig', res)
  return res
}

export const getAppKey = async () => {
  const gptConfig = await getGptConfig()
  console.log('getAppKey', gptConfig.app_key)
  return gptConfig.app_key || API_KEY
}

export const getAppId = async () => {
  const gptConfig = await getGptConfig()
  console.log('getAppId ', gptConfig.app_id)

  // const store = useAppStore.getState() as AppConfigStore
  return gptConfig.app_id || APP_ID
}

export const getApiUrl = async () => {
  const gptConfig = await getGptConfig()
  console.log('getApiUrl ', gptConfig.api_url)
  return gptConfig.api_url || API_URL
}

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
