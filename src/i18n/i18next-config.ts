'use client'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import commonEn from './lang/common.en'
import commonZh from './lang/common.zh'

import appEn from './lang/app.en'
import appZh from './lang/app.zh'

import toolsEn from './lang/tools.en'
import toolsZh from './lang/tools.zh'

import timeEn from './lang/time.en'
import timeZh from './lang/time.zh'

import type { Locale } from '.'
import { APP_INFO } from '../config'

const resources = {
  'en': {
    translation: {
      common: commonEn,
      app: appEn,
      // tools
      tools: toolsEn,
      time: timeEn,
    },
  },
  'zh-Hans': {
    translation: {
      common: commonZh,
      app: appZh,
      // tools
      tools: toolsZh,
      time: timeZh,
    },
  },
}

i18n.use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    lng: APP_INFO.default_language, // 设置默认语言为中文，与 APP_INFO.default_language 保持一致
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development', // 开启调试模式，方便排查问题
    resources,
    interpolation: {
      escapeValue: false, // React 已经默认转义
    },
  })

export const changeLanguage = (lan: Locale) => {
  i18n.changeLanguage(lan)
}
export default i18n
