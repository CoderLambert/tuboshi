'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getLocaleOnClient, setLocaleOnClient } from '@/i18n/client'
import { APP_INFO } from '@/config'
import { useNativeBridge } from '@/hooks/useNativeBridge'
type I18nProviderProps = {
  children: React.ReactNode
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const { i18n } = useTranslation()
  const { useInputsFormConfig } = useNativeBridge()

  const { langType } = useInputsFormConfig()

  useEffect(() => {
    // 获取当前客户端语言设置
    const currentLocale = getLocaleOnClient()
    const defaultLanguage = APP_INFO.default_language

    let lang = defaultLanguage

    // 根据 app 端的语言简写获取对应的语言
    // 菲律宾的语言环境 英文EN，中文 CN
    if(langType) {
      switch (langType.toLowerCase()) {
        case 'cn':
          lang = 'zh-Hans'
          break
        case 'en':
          lang = 'en'
          break
        default:
          lang = defaultLanguage
      }
    }

    // 如果当前语言与默认语言不一致，则设置为默认语言
    if (currentLocale !== lang || i18n.language !== lang)
      setLocaleOnClient(lang, true) // 不重新加载页面
  }, [i18n, langType])

  return <>{children}</>
}
