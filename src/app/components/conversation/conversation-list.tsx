'use client'
import type { FC } from 'react'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { IConversationItem } from '@/types/app'
import ConversationItem from './conversation-item'
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import cn from 'clsx'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { deleteConversationApi, renameConversationApi } from '@/services/conversation-api'
import Toast from '@/app/components/base/toast'
import { APP_INFO } from '@/config'
export type IConversationListProps = {
  conversationList: IConversationItem[]
  currentConversationId: string
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
  onConversationDeleted?: (conversationId: string) => void
  onConversationRenamed?: (conversationId: string, newName: string) => void
  isVisible: boolean
  onClose: () => void
  className?: string
}

const ConversationList: FC<IConversationListProps> = ({
  conversationList,
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  onConversationDeleted,
  onConversationRenamed,
  isVisible,
  onClose,
  className,
}) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [conversationListState, setConversationListState] = useState(conversationList)
  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null)
  const { useStatusBarHeight } = useNativeBridge()
  const { top } = useStatusBarHeight()
  const headerHight = 44

  // 同步外部数据变化到内部状态
  useEffect(() => {
    setConversationListState(conversationList)
  }, [conversationList])

  // 过滤会话列表
  const filteredConversations = conversationListState.filter((conversation) => {
    const conversationName = conversation.name || t('app.conversation.newConversation')
    return conversationName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // 清空搜索
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  // 乐观更新：立即更新本地状态
  const handleOptimisticRename = useCallback((conversationId: string, newName: string) => {
    setRenamingConversationId(conversationId)
    setConversationListState(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, name: newName }
          : conv,
      ),
    )
  }, [])

  const handleConversationClick = useCallback((conversationId: string) => {
    onConversationSelect(conversationId)
    onClose() // 选择后关闭列表
  }, [onConversationSelect, onClose])

  const handleNewConversation = useCallback(() => {
    // 检查是否已达到最大会话数限制
    const MAX_CONVERSATIONS = APP_INFO.max_conversations || 10
    if (conversationListState.length >= MAX_CONVERSATIONS) {
      // 显示警告提示，不关闭列表
      Toast.notify({
        type: 'warning',
        message: t('app.conversation.maxConversationLimit', { max: MAX_CONVERSATIONS }),
        duration: 4000,
      })
      return
    }

    onNewConversation()
    onClose() // 新建后关闭列表
  }, [conversationListState.length, onNewConversation, onClose, t])

  // 删除会话处理
  const handleDeleteConversation = useCallback(async (conversationId: string, isActiveConversation: boolean = false) => {
    const success = await deleteConversationApi(conversationId)
    if (success) {
      // 如果删除的是当前会话，需要切换到其他会话
      if (isActiveConversation) {
        // 找到删除后剩余的最新会话（按时间排序的第一个）
        const remainingConversations = conversationListState.filter(conv => conv.id !== conversationId)
        if (remainingConversations.length > 0) {
          // 切换到最新的会话
          const newestConversation = remainingConversations[0]
          onConversationSelect(newestConversation.id)
        }
        else {
          // 如果没有其他会话了，触发新建会话
          onNewConversation()
        }
        // 删除当前会话后关闭列表
        onClose()
      }

      onConversationDeleted?.(conversationId)
    }
  }, [conversationListState, onConversationDeleted, onConversationSelect, onNewConversation, onClose])

  // 重命名会话处理（支持乐观更新）
  const handleRenameConversation = useCallback(async (conversationId: string, newName: string) => {
    // 记录原始名称，用于错误回滚
    const originalConversation = conversationListState.find(conv => conv.id === conversationId)
    const originalName = originalConversation?.name

    const success = await renameConversationApi(conversationId, newName, handleOptimisticRename)

    // 无论成功或失败，都重置重命名状态
    setRenamingConversationId(null)

    if (success) {
      onConversationRenamed?.(conversationId, newName)
    }
    else {
      // API调用失败，回滚到原始名称
      if (originalName !== undefined) {
        setConversationListState(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? { ...conv, name: originalName }
              : conv,
          ),
        )
      }
    }
  }, [handleOptimisticRename, onConversationRenamed, conversationListState])

  if (!isVisible) { return null }

  return (
    <div className={cn('bg-opacity/50 fixed inset-0 z-[100] bg-black', className)}
      style={{
        top: `calc((${top} + ${headerHight}) * var(--tpx))`,
      }}
    >
      <div className="flex h-full">
        {/* 侧边栏 */}
        <div className="flex w-80 flex-col bg-white shadow-xl">
          {/* 搜索框 */}
          <div className="px-4 pt-4">
            <div className="relative flex">
              <input
                type="text"
                placeholder={t('app.conversation.searchPlaceholder') || '搜索会话...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500',
                  searchQuery ? 'pl-10 pr-10' : 'pl-10'
                )}
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  title={t('app.conversation.clearSearch') || '清空搜索'}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
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
                    isRenaming={renamingConversationId === conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                    onDelete={handleDeleteConversation}
                    onRename={handleRenameConversation}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 底部统计 */}
          {conversationListState.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <p className="text-center text-xs text-gray-500">
                {t('app.conversation.totalCount', { count: conversationListState.length })
                  || `共 ${conversationListState.length} 个会话`}
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
