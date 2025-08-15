import { useEffect, useState } from 'react'
import styles from './style.module.css'

export type QuestionItemsProps = {
    questions: string[];
    currentCategory: string;
    onClick: (question: string) => void;
    onQuestionClick?: (question: string) => void;
}

export function QuestionItems({
    currentCategory,
    questions,
    onClick,
    onQuestionClick,
}: QuestionItemsProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayQuestions, setDisplayQuestions] = useState(questions)
  const [displayCategory, setDisplayCategory] = useState(currentCategory)

  useEffect(() => {
    if (currentCategory !== displayCategory) {
      // 开始退出动画
      setIsAnimating(true)

      // 等待退出动画完成后更新内容
      setTimeout(() => {
        setDisplayQuestions(questions)
        setDisplayCategory(currentCategory)
        setIsAnimating(false)
      }, 200) // 退出动画时长
    }
 else {
      setDisplayQuestions(questions)
    }
  }, [currentCategory, questions, displayCategory])

  // 如果没有问题，不渲染
  if (displayQuestions.length === 0)
    return null

  return (
    <div className={styles.questions}>
      <div
        className={`${styles.questionsContainer} ${isAnimating ? styles.questionsExit : styles.questionsEnter}`}
        key={displayCategory}
      >
        {displayQuestions.map((question, index) => (
          <div
            key={`${displayCategory}-${index}`}
            className={`${styles.question} ${styles.questionItem}`}
            style={{
              animationDelay: `${index * 60}ms`, // 交错动画
            }}
            onClick={() => onQuestionClick ? onQuestionClick(question) : onClick(question)}
          >
            {question}
          </div>
        ))}
      </div>
    </div>
  )
}
