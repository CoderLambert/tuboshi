'use client'

import type { INaviAppSuggestionQuestionItem } from '@/types/app'
import styles from './style.module.css'
import { useMemo, useState } from 'react'
import { CategoryTabs } from './category-tabs'
import { QuestionItems } from './question-items'
// 常见问题引导页

export type IFAQProps = {
  suggestions: INaviAppSuggestionQuestionItem[]
  onQuestionClick?: (question: string) => void
}

export default function FAQGuide({ suggestions, onQuestionClick }: IFAQProps) {
  // 直接处理数据，避免异步状态更新
  const suggestionGroup = useMemo(() => {
    return suggestions.reduce((pre, cur) => {
      return {
        ...pre,
        ...cur,
      }
    }, {})
  }, [suggestions])

  const categories = useMemo(() => {
    return Object.keys(suggestionGroup)
  }, [suggestionGroup])

  // 直接设置默认分类，避免 useEffect 延迟
  const [currentCategory, setCurrentCategory] = useState<string>(() => {
    const cats = Object.keys(suggestionGroup)
    return cats.length > 0 ? cats[0] : ''
  })

  const questions = useMemo(() => {
    return suggestionGroup[currentCategory] || []
  }, [suggestionGroup, currentCategory])

  // 如果没有数据，直接返回 null
  if (categories.length === 0)
    return null

  return (
    <div className={styles.suggestion}>
      <div className={styles.tip}>
        你可以试试这样问我
      </div>

      <CategoryTabs
        categories={categories}
        onClick={setCurrentCategory}
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
      />

      <QuestionItems
        currentCategory={currentCategory}
        questions={questions}
        onClick={setCurrentCategory}
        onQuestionClick={onQuestionClick}
      />
    </div>
  )
}
