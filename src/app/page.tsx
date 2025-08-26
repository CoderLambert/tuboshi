'use client'
import Image from 'next/image'
import maomaoPng from '@/assets/maomao@2x.png'
import styles from './chatPage.module.css'
import FAQGuide from '@/app/components/FAQGuide'
import type { INaviAppSuggestionQuestionItem } from '@/types/app'
import { EVENTS, eventBus } from '@/app/utils/event-bus'
import Main from '@/app/components'
import { useTranslation } from 'react-i18next'

// import { NaitveInfoGetter } from '@/components/NaitveInfoGetter'
// import Link from 'next/link'
import type { QACategory } from '@/hooks/useAppStore'
import useAppStore from '@/hooks/useAppStore'
export default function Home() {
  // 语言设置现在由 I18nProvider 统一处理
const { qaData } = useAppStore() as { qaData: { data: QACategory[] } }
  const { t } = useTranslation()

const faqContent = qaData?.data || []

const questions: INaviAppSuggestionQuestionItem[] = faqContent.map(categoryItem => ({
  [categoryItem.questionCategory]: categoryItem.qaItemList.map(
    item => item.question,
  ),
}))
  const handleQuestionClick = (question: string) => {
    eventBus.emit(EVENTS.SEND_MESSAGE, question)
  }

  return (
    <div className="flex h-screen min-h-0 flex-col bg-white">
      {/* <NaitveInfoGetter /> */}

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
