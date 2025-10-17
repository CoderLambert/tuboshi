'use client'
import type { FC } from 'react'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'ahooks'
import type { ConversationItem } from '@/types/app'
import ConversationItem from './conversation-item'
import { ChevronLeftIcon, PlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import cn from 'clsx'

export type IConversationListProps = {
  conversationList: ConversationItem[]
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

  // 过滤会话列表
  const filteredConversations = conversationList.filter(conversation =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleConversationClick = useCallback((conversationId: string) => {
    onConversationSelect(conversationId)
    onClose() // 选择后关闭列表
  }, [onConversationSelect, onClose])

  const handleNewConversation = useCallback(() => {
    onNewConversation()
    onClose() // 新建后关闭列表
  }, [onNewConversation, onClose])

  if (!isVisible) return null

  return (
    <div className={cn('fixed inset-0 z-50 bg-black bg-opacity-50 mt-[150px]', className)}>
      <div className="flex h-full">
        {/* 侧边栏 */}
        <div className="w-80 bg-white shadow-xl flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('app.conversation.title') || '会话列表'}
              </h2>
            </div>
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t('app.conversation.newChat') || '新会话'}
              </span>
            </button>
          </div>

          {/* 搜索框 */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative flex">
              <input
                type="text"
                placeholder={t('app.conversation.searchPlaceholder') || '搜索会话...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 会话列表 */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-center text-xs">
                  {searchQuery
                    ? (t('app.conversation.noSearchResults') || '未找到匹配的会话')
                    : (t('app.conversation.noConversations') || '暂无会话记录')
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleNewConversation}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {t('app.conversation.startFirstChat') || '开始第一次对话'}
                  </button>
                )}
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.map((conversation) => (
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
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                {t('app.conversation.totalCount', { count: conversationList.length }) ||
                 `共 ${conversationList.length} 个会话`}
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