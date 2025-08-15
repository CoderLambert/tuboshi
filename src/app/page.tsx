import Image from 'next/image'
import maomaoPng from '@/assets/maomao@2x.png'
import styles from './chatPage.module.css'
import FAQGuide from '@/app/components/FAQGuide'
import type { INaviAppSuggestionQuestionItem } from '@/types/app'
// import { NaitveInfoGetter } from '@/components/NaitveInfoGetter'
import Main from '@/app/components'
// import Link from 'next/link'
export default function Home() {
  // 语言设置现在由 I18nProvider 统一处理
  const questions: INaviAppSuggestionQuestionItem[] = [
    {
        收派: [
            '联系不上客户怎么办？',
            '打火机可以寄吗？',
            '包装破损了怎么办？',
        ],
    },
    {
        数据统计: [
          '最近七天订单数量？',
          '打火机可以寄吗？',
          '包装破损了怎么办？',
        ],
    },
]

  return (
    <div className={styles.chatPage}>
      {/* <NaitveInfoGetter /> */}

      <div className={styles.header}>
        <Image className={styles.logo} src={maomaoPng} alt="Maomao" />
        <h1 className={styles.intro}>我是MAOMAO，你的智能助手</h1>
      </div>

      {/* 问题建议 */}
      <FAQGuide suggestions={questions}></FAQGuide>

      {/* 消息列表 */}

      <Main params={{}}></Main>
      {/* <Link
          className="text-sm text-blue-500 hover:text-blue-700"
          href="/test/api">测试</Link> */}
      {/* <MessageInfo></MessageInfo> */}
    </div>
  )
}
