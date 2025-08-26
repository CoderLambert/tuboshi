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
import { NaitveInfoGetter } from '@/components/NaitveInfoGetter'
// import Link from 'next/link'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useCallback, useEffect } from 'react'
import Button from './components/chat/button'

export default function Home() {
  // 语言设置现在由 I18nProvider 统一处理
const { t } = useTranslation()
const { useAppRequestHeader, useGPTConfig, useUserInfo, useStatusBarHeight, useQaData, useInputsFormConfig, useUserID } = useNativeBridge()
const qaData: { data: QACategory[] } = useQaData()
const userInfo: { user_id: string } = useUserID()
const inputsFormConfig = useInputsFormConfig() // 提前调用 Hook

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
    if (typeof window !== 'undefined') { // 确保只在浏览器中运行
        import('vconsole').then((module) => {
          const VConsole = module.default
          const vConsole = new VConsole()
          // 可添加自定义配置，如只在特定 URL 参数下启用：if (new URLSearchParams(window.location.search).has('debug'))
          return () => vConsole.destroy()
        }).catch((error) => {
          console.error('加载 vConsole 失败:', error)
        })
    }
  }, [])
 const handleClick = useCallback(() => {
    console.log(`inputsFormConfig: ${JSON.stringify(inputsFormConfig)}`) // 使用已获取的值
  }, [inputsFormConfig])
  return (
    <div className="flex h-screen min-h-0 flex-col bg-white">
      <NaitveInfoGetter />

      <Button onClick={handleClick}> getInputsForm</Button>

      {/* <TopBar /> */}
      {/* <SafeAreaLayout title="MaoMao AI">
          <div className={styles.header}>
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
          </div>
      </SafeAreaLayout> */}

            <div className={styles.header}>
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
          <div className="min-h-0 flex-1">
            <Main params={{}}></Main>
          </div>

    </div>
  )
}
