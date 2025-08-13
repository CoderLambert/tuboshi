'use client'

import { useTranslation } from 'react-i18next'

export default function TranslationTest() {
  const { t, i18n } = useTranslation()

  return (
    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
      <h3 className="mb-2 font-bold">翻译测试组件</h3>
      <div className="space-y-1 text-sm">
        <div>当前语言: <span className="font-mono">{i18n.language}</span></div>
        <div>app.mermaid.classic: <span className="font-mono">"{t('app.mermaid.classic')}"</span></div>
        <div>app.theme.switchLight: <span className="font-mono">"{t('app.theme.switchLight')}"</span></div>
        <div>app.chat.newChat: <span className="font-mono">"{t('app.chat.newChat')}"</span></div>
      </div>
    </div>
  )
}
