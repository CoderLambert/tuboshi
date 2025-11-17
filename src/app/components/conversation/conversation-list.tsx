'use client'
import type { FC } from 'react'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { IConversationItem } from '@/types/app'
import ConversationItem from './conversation-item'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import cn from 'clsx'
import { useNativeBridge } from '@/hooks/useNativeBridge'
export type IConversationListProps = {
  conversationList: IConversationItem[]
  currentConversationId: string
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
  isVisible: boolean
  onClose: () => void
  className?: string
}

const ConversationList: FC<IConversationListProps> = ({
  conversationList,
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  isVisible,
  onClose,
  className,
}) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const { useStatusBarHeight } = useNativeBridge()
  const { top } = useStatusBarHeight()
  const headerHight = 44
  // 过滤会话列表
  const filteredConversations = conversationList.filter(conversation =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleConversationClick = useCallback((conversationId: string) => {
    onConversationSelect(conversationId)
    onClose() // 选择后关闭列表
  }, [onConversationSelect, onClose])

  const handleNewConversation = useCallback(() => {
    onNewConversation()
    onClose() // 新建后关闭列表
  }, [onNewConversation, onClose])

  if (!isVisible) { return null }

  return (
    <div className={cn('fixed inset-0 z-[1000] bg-black bg-opacity-50', className)}
      style={{
        top: `calc((${top} + ${headerHight}) * var(--tpx))`,
      }}
    >
      <div className="flex h-full">
        {/* 侧边栏 */}
        <div className="flex w-80 flex-col bg-white shadow-xl">
          {/* 搜索框 */}
          <div className="border-b border-gray-100 p-4">
            <div className="relative flex">
              <input
                type="text"
                placeholder={t('app.conversation.searchPlaceholder') || '搜索会话...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 会话列表 */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-gray-500">
                <ChatBubbleLeftRightIcon className="mb-4 h-12 w-12 text-gray-300" />
                <p className="text-center text-xs">
                  {searchQuery
                    ? (t('app.conversation.noSearchResults') || '未找到匹配的会话')
                    : (t('app.conversation.noConversations') || '暂无会话记录')
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleNewConversation}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                  >
                    {t('app.conversation.startFirstChat') || '开始第一次对话'}
                  </button>
                )}
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.map(conversation => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={conversation.id === currentConversationId}
                    onClick={() => handleConversationClick(conversation.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 底部统计 */}
          {conversationList.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <p className="text-center text-xs text-gray-500">
                {t('app.conversation.totalCount', { count: conversationList.length })
                  || `共 ${conversationList.length} 个会话`}
              </p>
            </div>
          )}
        </div>

        {/* 遮罩层，点击关闭 */}
        <div
          className="flex-1"
          onClick={onClose}
        />
      </div>
    </div>
  )
}

export default React.memo(ConversationList)
