import Image from "next/image";
import maomaoPng from "@/assets/maomao@2x.png";
import styles from './chatPage.module.css'
import FAQGuide from '@/app/components/FAQGuide'
import {MessageInfo} from '@/app/components/chat/message'
import {INaviAppSuggestionQuestionItem} from "@/types/app"
import TranslationTest from '@/app/components/TranslationTest'

export default function Home() {
  // 语言设置现在由 I18nProvider 统一处理
  const questions: INaviAppSuggestionQuestionItem[] = [
    {
        "收派": [
            "联系不上客户怎么办？",
            "打火机可以寄吗？",
            "包装破损了怎么办？"
        ]
    }, 
    {
        "数据统计": [
          "最近七天订单数量？",
          "打火机可以寄吗？",
          "包装破损了怎么办？"
        ]
    }
]

  return (
    <div className={styles.chatPage}>
      <div className={styles.header}>
        <Image className={styles.logo} src={maomaoPng} alt="Maomao" />
        <h1 className={styles.intro}>我是MAOMAO，你的智能助手</h1>
      </div>

      {/* i18n 测试组件 */}
      {/* <div className="mb-4">
        <TranslationTest />
      </div> */}

      {/* 问题建议 */}
      <FAQGuide suggestions={questions}></FAQGuide>

      {/* 消息列表 */}

      <MessageInfo></MessageInfo>
    </div>
  );
}
