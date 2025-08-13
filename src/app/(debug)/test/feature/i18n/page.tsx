'use client'

import { useTranslation } from 'react-i18next'
import { getLocaleOnClient, setLocaleOnClient } from '@/i18n/client'
import { APP_INFO } from '@/config'

export default function TestI18nPage() {
  const { t, i18n } = useTranslation()

  const handleLanguageChange = (locale: 'en' | 'zh-Hans') => {
    setLocaleOnClient(locale, true)
  }

  return (
    <div className="prose space-y-6 p-8">
      <h1 className="text-2xl font-bold">i18n 测试页面</h1>

      <div className="space-y-4">
        <div>
          <strong>当前语言:</strong> {i18n.language}
        </div>
        <div>
          <strong>Cookie 中的语言:</strong> {getLocaleOnClient()}
        </div>
        <div>
          <strong>默认语言:</strong> {APP_INFO.default_language}
        </div>
      </div>

      <div className="space-x-4">
        <button
          onClick={() => handleLanguageChange('en')}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          切换到英文
        </button>
        <button
          onClick={() => handleLanguageChange('zh-Hans')}
          className="rounded bg-green-500 px-4 py-2 text-white"
        >
          切换到中文
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">翻译测试:</h2>
        <div>
          <strong>app.common.welcome:</strong> {t('app.common.welcome')}
        </div>
        <div>
          <strong>app.mermaid.classic:</strong> {t('app.mermaid.classic')}
        </div>
        <div>
          <strong>app.mermaid.handDrawn:</strong> {t('app.mermaid.handDrawn')}
        </div>
        <div>
          <strong>app.theme.switchLight:</strong> {t('app.theme.switchLight')}
        </div>
        <div>
          <strong>app.theme.switchDark:</strong> {t('app.theme.switchDark')}
        </div>
        <div>
          <strong>app.chat.newChat:</strong> {t('app.chat.newChat')}
        </div>
      </div>

      <div className="mt-8 rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-semibold">调试信息:</h3>
        <pre className="text-sm">
          {JSON.stringify({
            'i18n.language': i18n.language,
            'i18n.languages': i18n.languages,
            'getLocaleOnClient()': getLocaleOnClient(),
            'APP_INFO.default_language': APP_INFO.default_language,
            'i18n.options.lng': i18n.options.lng,
            'i18n.options.fallbackLng': i18n.options.fallbackLng,
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
