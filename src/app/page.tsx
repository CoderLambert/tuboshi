'use client'
import Image from 'next/image'
import maomaoPng from '@/assets/maomao@2x.png'
import styles from './chatPage.module.css'
import FAQGuide from '@/app/components/FAQGuide'
import type { INaviAppSuggestionQuestionItem } from '@/types/app'
import { EVENTS, eventBus } from '@/app/utils/event-bus'
import Main from '@/app/components'
import { useTranslation } from 'react-i18next'
import type { QACategory } from '@/hooks/useAppStore'

import { useNativeBridge } from '@/hooks/useNativeBridge'
import { USERID_COOKIE_NAME } from '@/config'
import SafeAreaLayout from './components/SafeAreaLayout'
import { useEffect, useState } from 'react'
import { startDemo } from '@/demo/start'
import PhoneBoot from '@/demo/PhoneBoot'

import { enhancedCookies } from '@/lib/browser-cookie'
import useConversation from '@/hooks/use-conversation'
import { SendingProvider } from '@/app/contexts/SendingContext'
import { transformFaqContentWithZod } from '@/lib/utils'
export default function Home() {
  // 语言设置现在由 I18nProvider 统一处理
  const { t } = useTranslation()
  const [demoReady, setDemoReady] = useState(false)
  const { useQaData, useUserID, useGPTConfig } = useNativeBridge()
  const qaData: { data: QACategory[] } = useQaData()

  const userInfo = useUserID()

  const gptConfig = useGPTConfig()

  const faqContent = qaData?.data || []

  const questions: INaviAppSuggestionQuestionItem[] = transformFaqContentWithZod(faqContent)
  const handleQuestionClick = (question: string) => {
    eventBus.emit(EVENTS.SEND_MESSAGE, question)
  }

  const { emitCreateConversation, emitToggleHistoryConversation } = useConversation()

  // ✅ 使用分支感知的 eruda 加载逻辑
  useEffect(() => {
    // 检查环境变量决定是否加载 eruda
    const enableEruda = process.env.NEXT_PUBLIC_ENABLE_ERUDA === 'true'

    if (enableEruda) {
      import('eruda').then((eruda) => {
        eruda.default.init()
      }).catch((error) => {
        console.warn('加载 Eruda 失败:', error)
      })
    }
  }, [])

  // 设置用户ID cookie
  useEffect(() => {
    if (userInfo && userInfo['user-id']) {
      enhancedCookies.set(USERID_COOKIE_NAME, userInfo['user-id'])
      console.log('USERID_COOKIE_NAME ==>', userInfo['user-id'])
    }
  }, [userInfo])

  useEffect(() => {
    let cancelled = false
    startDemo().then(() => {
      if (!cancelled)
        setDemoReady(true)
    }).catch(() => {
      if (!cancelled)
        setDemoReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (gptConfig && gptConfig.app_key && userInfo && userInfo['user-id']) {
      console.log('gpt_config loaded:', gptConfig)
      enhancedCookies.set('gpt_config', JSON.stringify(gptConfig), userInfo['user-id'])
    }
  }, [gptConfig, userInfo])

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white">
      <SendingProvider>
        <SafeAreaLayout title={t('app.common.title')} onNewConversation={emitCreateConversation} onShowHistory={emitToggleHistoryConversation}>
          <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
            <div className={`${styles.header} shrink-0`}>
              <Image className={styles.logo} src={maomaoPng} alt="Courier assistant" />
              <h1 className={styles.intro}>{t('app.common.welcome')}</h1>
            </div>
            {
              faqContent.length > 0 && (
                <div className="min-w-0 shrink-0">
                  <FAQGuide
                    suggestions={questions}
                    onQuestionClick={handleQuestionClick}
                  />
                </div>
              )
            }

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {
                demoReady && userInfo && userInfo['user-id'] && gptConfig && gptConfig.app_key
                  ? <Main params={{}}></Main>
                  : <PhoneBoot label="Loading" />
              }
            </div>
          </div>
        </SafeAreaLayout>
      </SendingProvider>
    </div>
  )
}
