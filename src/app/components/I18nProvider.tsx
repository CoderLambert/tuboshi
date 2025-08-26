'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getLocaleOnClient, setLocaleOnClient } from '@/i18n/client'
import { APP_INFO } from '@/config'

type I18nProviderProps = {
  children: React.ReactNode
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const { i18n } = useTranslation()

  useEffect(() => {
    // 获取当前客户端语言设置
    const currentLocale = getLocaleOnClient()
    const defaultLanguage = APP_INFO.default_language

    // console.log('I18nProvider - Current locale:', currentLocale)
    // console.log('I18nProvider - Default language:', defaultLanguage)
    // console.log('I18nProvider - i18n language:', i18n.language)

    // 如果当前语言与默认语言不一致，则设置为默认语言
    if (currentLocale !== defaultLanguage || i18n.language !== defaultLanguage) {
      // console.log('I18nProvider - Setting language to:', defaultLanguage)
      setLocaleOnClient(defaultLanguage, true) // 不重新加载页面
    }
  }, [i18n])

  return <>{children}</>
}
