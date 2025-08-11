"use client"

import { AnimatePresence, motion } from "motion/react"  // 直接导入 AnimatePresence
import { INavieAppSuggesQuestionItem } from '@/types/app'
import styles from './style.module.css'
import { useState, useEffect } from "react"

// 常见问题引导页

export interface IFAQProps {
  suggestions: INavieAppSuggesQuestionItem[]
}

export default function FAQGuide({ suggestions }: IFAQProps) {

  const [suggestionGroup, setSuggestionGroup] = useState<Record<string, string[]>>({})
  const [currentCategory, setCurrentCategory] = useState<string>("")
  const [categories, setCategories] = useState<string[]>([])

  const [questions, setQuestions] = useState<string[]>([])

  useEffect(() => {
    const _suggestiongroup = suggestions.reduce((pre, cur) => {
      return {
        ...pre,
        ...cur
      }
    }, {})

    setSuggestionGroup(_suggestiongroup)

    const categories = Object.keys(_suggestiongroup);
    setCategories(categories)
    setCurrentCategory(categories[0])
  }, [suggestions])

  useEffect(() => {
    // 获取当前问题列表
    setQuestions(suggestionGroup[currentCategory] || [])
  }, [currentCategory])

  // 定义动画 variants（优化：统一管理动画配置）
 // variants 定义（保持类似，但简化 stagger）
const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.05,  // 减小 stagger 时间，让交错更快
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1]  // 自定义 ease 曲线，更平滑
    }
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3 } }
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

  const categoryVariants = {
    inactive: { color: "#8F8F91", scale: 1 },
    active: { color: "#010101", scale: 1.05, transition: { duration: 0.2 } }
  }

  const renderCategories = () => {
    return (
      <div className={styles.categories}>
        {categories.map((category, index) => (
          <motion.div
            key={index}
            className={`${styles.categoryName} ${category === currentCategory ? styles.categoryNameActive : ''}`}
            onClick={() => setCurrentCategory(category)}
            variants={categoryVariants}
            animate={category === currentCategory ? "active" : "inactive"}  // 为类别添加动画过渡
            whileHover={{ scale: 1.1 }}  //  hover 效果优化交互
          >
            {category}
          </motion.div>
        ))}
      </div>
    )
  }

  const renderQuestions = () => {
    return (
      <AnimatePresence mode="wait">  // 使用 AnimatePresence 处理切换时的退出/进入
        <motion.div
          key={currentCategory}  // key 确保每次类别切换时重新动画
          className={styles.questions}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          layout
        >
          {questions.map((question, index) => (
            <motion.div
              key={index}  // 确保 key 唯一，避免复用抖动
              className={styles.question}
              variants={itemVariants}
              whileHover={{ scale: 1.02, backgroundColor: "#E0E0E2" }}
              layout  // 添加 layout 到项
            >
              {question}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className={styles.suggestion}>
      <div className={styles.tip}>
        你可以试试这样问我
      </div>

      {renderCategories()}

      {renderQuestions()}
    </div>
  )
}