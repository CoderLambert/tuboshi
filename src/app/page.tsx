'use client'
import Image from 'next/image'
import maomaoPng from '@/assets/maomao@2x.png'
import styles from './chatPage.module.css'
import FAQGuide from '@/app/components/FAQGuide'
import type { INaviAppSuggestionQuestionItem } from '@/types/app'
import { EVENTS, eventBus } from '@/app/utils/event-bus'
import Main from '@/app/components'
import { NaitveInfoGetter } from '@/components/NaitveInfoGetter'
// import Link from 'next/link'
import type { QACategory } from '@/hooks/useAppStore'
import useAppStore from '@/hooks/useAppStore'
export default function Home() {
  // 语言设置现在由 I18nProvider 统一处理
const { qaData } = useAppStore() as { qaData: { data: QACategory[] } }
const faqContent = qaData?.data || []
  // const faqContent = [
  //   {
  //     questionCategory: 'category1',
  //     qaItemList: [
  //       {
  //         question: 'question1',
  //         answer: 'answer1',
  //       },
  //          {
  //         question: 'question2',
  //         answer: 'answer2',
  //       },
  //       {
  //         question: 'question3',
  //         answer: 'answer3',
  //       },
  //     ],
  //   },
  //     {
  //     questionCategory: 'category2',
  //     qaItemList: [
  //       {
  //         question: 'question-2-1',
  //         answer: 'answer-2-1',
  //       },
  //          {
  //         question: 'question-2-2',
  //         answer: 'answer-2-2',
  //       },
  //       {
  //         question: 'question-2-3',
  //         answer: 'answer-2-3',
  //       },
  //     ],
  //   },
  //        {
  //     questionCategory: 'category3',
  //     qaItemList: [
  //       {
  //         question: 'question-3-1',
  //         answer: 'answer-3-1',
  //       },
  //          {
  //         question: 'question-3-2',
  //         answer: 'answer-3-2',
  //       },
  //       {
  //         question: 'question-3-3',
  //         answer: 'answer-3-3',
  //       },
  //     ],
  //   },
  // ]
const questions: INaviAppSuggestionQuestionItem[] = faqContent.map(categoryItem => ({
  [categoryItem.questionCategory]: categoryItem.qaItemList.map(
    item => item.question,
  ),
}))
  const handleQuestionClick = (question: string) => {
    const allQuestionAnswers = faqContent.map(item => item.qaItemList).flat()
    const answer = allQuestionAnswers.find(item => item.question === question)?.answer
    eventBus.emit(EVENTS.SEND_MESSAGE, answer)
  }

  return (
    <div className="flex h-screen min-h-0 flex-col bg-white">
      <NaitveInfoGetter />

      <div className={styles.header}>
        <Image className={styles.logo} src={maomaoPng} alt="Maomao" />
        <h1 className={styles.intro}>我是MAOMAO，你的智能助手</h1>
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
