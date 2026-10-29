// src/app/components/chat/try-to-ask.tsx
import type { FC } from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@/app/components/base/button'
import Divider from '@/app/components/base/divider'
import cn from '@/utils/classnames'
import type { VisionFile } from '@/types/app'
import Loading from '@/app/components/base/loading' // 引入 Loading 组件

type TryToAskProps = {
  suggestedQuestions: string[]
  onSend: (message: string, files?: VisionFile[]) => void
  isMobile?: boolean
  isLoading?: boolean // 新增 isLoading 属性
}

const TryToAsk: FC<TryToAskProps> = ({
  suggestedQuestions,
  onSend,
  isMobile,
  isLoading = false, // 默认值为 false
}) => {
  const { t } = useTranslation()

  // 如果正在加载，显示 loading 状态
  if (isLoading) {
    return (
      <div className='mb-2 py-2'>
        <div className={cn('mb-2.5 flex items-center justify-between gap-2', isMobile && 'justify-end')}>
          <Divider bgStyle='gradient' className='h-px grow rotate-180' />
          <div className='system-xs-medium flex shrink-0 items-center text-text-tertiary'>
            <Loading type='app' className='!text-primary-500 mr-2' />
            {t('app.chat.generatingSuggestions')}
          </div>
          {!isMobile && <Divider bgStyle='gradient' className='h-px grow' />}
        </div>
      </div>
    )
  }

  // 如果没有建议问题，不渲染任何内容
  if (!suggestedQuestions || suggestedQuestions.length === 0)
    return null

  // 正常显示建议问题
  return (
    <div className='mb-2 py-2'>
      <div className={cn('mb-2.5 flex items-center justify-between gap-2', isMobile && 'justify-end')}>
        <Divider bgStyle='gradient' className='h-px grow rotate-180' />
        <div className='system-xs-medium-uppercase shrink-0 text-text-tertiary'>{t('app.chat.tryToAsk')}</div>
        {!isMobile && <Divider bgStyle='gradient' className='h-px grow' />}
      </div>
      <div className={cn('flex w-full min-w-0 flex-wrap justify-center', isMobile && 'justify-end')}>
        {
          suggestedQuestions.map((suggestQuestion, index) => (
            <Button
              size='small'
              key={index}
              variant='secondary-accent'
              className='mb-1 mr-1 !h-auto max-w-full !whitespace-normal text-left last:mr-0'
              onClick={() => onSend(suggestQuestion)}
            >
              {suggestQuestion}
            </Button>
          ))
        }
      </div>
    </div>
  )
}

export default memo(TryToAsk)
