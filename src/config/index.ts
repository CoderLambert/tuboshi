import type { AppInfo, IAPPConfig, INaviAppConfig } from '@/types/app'
export const API_KEY = 'app-Bw7GY5U1f7d4XIxXxWRuHueC'
export const APP_ID = 'a486b436-4997-4331-b6ec-a78d6f47122c'
export const API_URL = 'http://10.21.61.78:31092/v1'

// 大模型平台 App 信息配置， 需要 jsBridge 返回
export const APP_INFO: AppInfo = {
  title: 'Chat APP',
  description: '',
  copyright: '',
  privacy_policy: '',
  default_language: 'zh-Hans',
}

export const APP_CONFIG: IAPPConfig = {
  app_info: APP_INFO,
  app_key: API_KEY,
  app_id: APP_ID,
  api_url: API_URL,
  conversation_id: null,
  first_id: null,
}

// 业务 app 配置

export const NavieAppConfig: INaviAppConfig = {
  token: '',
  user: '',
  suggestions: [],
}

export const isShowPrompt = false
export const promptTemplate = 'I want you to act as a javascript console.'

export const API_PREFIX = '/api'

export const LOCALE_COOKIE_NAME = 'locale'

export const DEFAULT_VALUE_MAX_LEN = 48
