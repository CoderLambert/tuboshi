'use client'
import Cookies from 'js-cookie'
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
import { useEffect } from 'react'
import { USERID_COOKIE_NAME } from '@/config'
import SafeAreaLayout from './components/SafeAreaLayout'
import Link from 'next/link'
export default function Home() {
  // 语言设置现在由 I18nProvider 统一处理
const { t } = useTranslation()
const { useQaData, useUserID, useGPTConfig } = useNativeBridge()
const qaData: { data: QACategory[] } = useQaData()
// init user-id
const userInfo = useUserID()
const gptConfig = useGPTConfig()
console.log('userInfo')
console.log('gptConfig')
console.log(gptConfig)
Cookies.set(USERID_COOKIE_NAME, userInfo['user-id'] || 'abc-123')

const faqContent = qaData?.data || []

const questions: INaviAppSuggestionQuestionItem[] = faqContent.map(categoryItem => ({
  [categoryItem.questionCategory]: categoryItem.qaItemList.map(
    item => item.question,
  ),
}))
  const handleQuestionClick = (question: string) => {
    eventBus.emit(EVENTS.SEND_MESSAGE, question)
  }

  useEffect(() => {
    // if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') { // 确保只在浏览器中运行
    if (typeof window !== 'undefined') { // 确保只在浏览器中运行
      // import('vconsole').then((module) => {
      //     const VConsole = module.default
      //     const vConsole = new VConsole()
      //     // 可添加自定义配置，如只在特定 URL 参数下启用：if (new URLSearchParams(window.location.search).has('debug'))
      //     return () => vConsole.destroy()
      //   }).catch((error) => {
      //     console.error('加载 vConsole 失败:', error)
      //   })
    }
  }, [])
  return (
    <div className="flex h-screen min-h-0 flex-col bg-white">

       <SafeAreaLayout title="MaoMao AI">
          <div className={styles.header}>
            <Image className={styles.logo} src={maomaoPng} alt="Maomao" />
            <h1 className={styles.intro}>{t('app.common.welcome')}</h1>
          </div>

          <Link className='text-sm text-blue-500 hover:text-blue-700' href="/test/api"> api 测试</Link>
          {
          faqContent.length > 0 && <FAQGuide
                  suggestions={questions}
                  onQuestionClick={handleQuestionClick}
              />
          }
          {/* 消息列表 - 占据剩余空间 */}
           <div className="min-h-0 flex-1">
            <Main params={{}}></Main>
          </div>
      </SafeAreaLayout>

            {/* <div className={styles.header}>
            <Image className={styles.logo} src={maomaoPng} alt="Maomao" />
            <h1 className={styles.intro}>{t('app.common.welcome')}</h1>
          </div>
          {
          faqContent.length > 0 && <FAQGuide
                  suggestions={questions}
                  onQuestionClick={handleQuestionClick}
              />
          }
          {/* 消息列表 - 占据剩余空间 */}
          {/* <div className="min-h-0 flex-1">
            <Main params={{}}></Main>
          </div> */}

    </div>
  )
}
