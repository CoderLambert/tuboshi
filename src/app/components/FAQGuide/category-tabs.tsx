
import styles from './style.module.css'

export interface CategoryTabsProps {
    categories: string[];
    onClick: (category: string) => void;
    currentCategory: string;
    setCurrentCategory: (category: string) => void;
}

export function CategoryTabs ({
    categories,
    onClick,
    currentCategory,
    setCurrentCategory
}: CategoryTabsProps) {
    return (
      <div className={styles.categories}>
        {categories.map((category, index) => (
          <div
            key={index}
            className={`${styles.categoryName} ${category === currentCategory ? styles.categoryNameActive : ''}`}
            onClick={() => setCurrentCategory(category)}
          >
            {category}
          </div>
        ))}
      </div>
    )
}
