import type { AppInfo } from '@/types/app'
import { getGPTConfig } from '@/lib/jsBridge'

export const GPT_CONFIG_COOKIE_NAME = 'gpt_config'
export const LOCALE_COOKIE_NAME = 'locale'
export const USERID_COOKIE_NAME = 'user_id'

export const isShowPrompt = false
export const API_PREFIX = '/ai-chat/aa/api'

export const DEFAULT_VALUE_MAX_LEN = 48
export const promptTemplate = 'I want you to act as a assistant.'

export const getGptConfig = async () => {
  const res = await getGPTConfig()
  console.log('getGptConfig', res)
  console.log('****** getGptConfig Cookies set finished *******')
  return res
}

export const getAppKey = async () => {
  const gptConfig = await getGptConfig()
  console.log('getAppKey', gptConfig.app_key)
  return gptConfig.app_key
}

export const getAppId = async () => {
  const gptConfig = await getGptConfig()
  console.log('getAppId ', gptConfig.app_id)
  return gptConfig.app_id
}

export const getApiUrl = async () => {
  const gptConfig = await getGptConfig()
  console.log('getApiUrl ', gptConfig.api_url)
  return gptConfig.api_url
}

// 大模型平台 App 信息配置， 需要 jsBridge 返回
export const APP_INFO: AppInfo = {
  title: 'Chat APP',
  description: '',
  copyright: '',
  privacy_policy: '',
  default_language: 'en',
}
