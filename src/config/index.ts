import type { AppInfo } from '@/types/app'
export const API_KEY = 'app-Bw7GY5U1f7d4XIxXxWRuHueC'
export const APP_ID = 'a486b436-4997-4331-b6ec-a78d6f47122c'
export const API_URL = 'http://10.21.61.78:31092/v1'

// export const API_KEY = 'app-OzDb7ZrJKLPQ8rYpYTq5ZZg9'
// export const APP_ID = 'c4acfcf5-ff94-49f2-9c6b-c78f04f03e2b'
// export const API_URL = 'https://ai-agent.jtexpress.ph/v1'

// app - OzDb7ZrJKLPQ8rYpYTq5ZZg9

// export const API_KEY = 'app-LatVVNGAlBpkovt6WptWjFIy'
// export const APP_ID = 'e7b5c737-d31b-45af-963c-7952dccb91fa'
// export const API_URL = 'http://10.98.72.54:30585/v1'

// export const APP_TOKEN = 'fddfee47fe9a48b08f50b15040dc521b'
// https://demo-ai-agent.jtexpress.ph/mine/app/e7b5c737-d31b-45af-963c-7952dccb91fa/develop
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
