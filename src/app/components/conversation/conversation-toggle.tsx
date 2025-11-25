'use client'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Bars3Icon } from '@heroicons/react/24/outline'
import cn from 'clsx'

export type IConversationToggleProps = {
  onClick?: () => void
  className?: string
  conversationCount?: number
}

const ConversationToggle: FC<IConversationToggleProps> = ({
  onClick,
  className,
  conversationCount = 0,
}) => {
  const { t } = useTranslation()

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md',
        className,
      )}
      title={t('app.conversation.toggleTitle') || '切换会话'}
    >
      <Bars3Icon className="h-5 w-5 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">
        {t('app.conversation.toggle') || '会话'}
      </span>
      {conversationCount > 0 && (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
          {conversationCount > 99 ? '99+' : conversationCount}
        </span>
      )}
    </button>
  )
}

export default ConversationToggle
