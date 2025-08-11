import type { AppInfo, INaviAppConfig, IAPPConfig } from '@/types/app'
export const API_KEY = 'app-DMDbtd9hFVIFkZHpsTlnsbrm'
export const APP_ID = 'c3394ff1-df77-4dae-9006-9115ec1e40d6'
export const API_URL = 'http://10.21.61.78:31092/v1'

// 大模型平台 App 信息配置， 需要 jsBridge 返回
export const APP_INFO: AppInfo   = {
  title: 'Chat APP',
  description: '',
  copyright: '',
  privacy_policy: '',
  default_language: 'zh-Hans',
}

export const APP_CONFIG: IAPPConfig  = {
  app_info: APP_INFO,
  app_key: API_KEY,
  app_id: APP_ID,
  api_url: API_URL,
  last_conversation_id: null,
  first_id: null
}

// 业务 app 配置

export const NavieAppConfig: INaviAppConfig = {
  token: '',
  user: '',
  suggestions: []
}


export const isShowPrompt = false
export const promptTemplate = 'I want you to act as a javascript console.'

export const API_PREFIX = '/api'

export const LOCALE_COOKIE_NAME = 'locale'

export const DEFAULT_VALUE_MAX_LEN = 48
