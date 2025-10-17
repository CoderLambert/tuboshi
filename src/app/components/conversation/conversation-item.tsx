'use client'
import type { FC } from 'react'
import React, { memo } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import type { ConversationItem as ConversationItemType } from '@/types/app'
import { ChatBubbleLeftRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import cn from 'clsx'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export type IConversationItemProps = {
  conversation: ConversationItemType
  isActive?: boolean
  onClick?: () => void
  onDelete?: (conversationId: string) => void
  onRename?: (conversationId: string, newName: string) => void
  className?: string
}

const ConversationItem: FC<IConversationItemProps> = ({
  conversation,
  isActive = false,
  onClick,
  onDelete,
  onRename,
  className,
}) => {
  // 处理会话名称显示
  const displayName = conversation.name ||
    (conversation.introduction ?
      conversation.introduction.substring(0, 30) + (conversation.introduction.length > 30 ? '...' : '') :
      '新会话')

  // 格式化时间显示（这里假设有更新时间字段，如果没有可以使用其他逻辑）
  const formatTime = () => {
    // 由于原始类型中没有时间字段，这里使用一个默认显示
    // 实际项目中可能需要从conversation中获取last_updated_at等字段
    return '最近'
  }

  const handleClick = () => {
    onClick?.()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('确定要删除这个会话吗？')) {
      onDelete?.(conversation.id)
    }
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newName = window.prompt('请输入新的会话名称：', conversation.name)
    if (newName && newName.trim() && newName !== conversation.name) {
      onRename?.(conversation.id, newName.trim())
    }
  }

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200',
        'hover:bg-gray-50 active:bg-gray-100',
        isActive && 'bg-blue-50 border border-blue-200',
        className
      )}
      onClick={handleClick}
    >
      {/* 会话图标 */}
      <div className={cn(
        'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0',
        isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
      )}>
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
      </div>

      {/* 会话信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className={cn(
            'font-medium truncate text-sm',
            isActive ? 'text-blue-900' : 'text-gray-900'
          )}>
            {displayName}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatTime()}
          </span>
        </div>

        {/* 会话介绍或最后一条消息预览 */}
        {conversation.introduction && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            {conversation.introduction}
          </p>
        )}

        {/* 建议问题预览 */}
        {conversation.suggested_questions && conversation.suggested_questions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {conversation.suggested_questions.slice(0, 2).map((question, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded truncate"
                style={{ maxWidth: '120px' }}
              >
                {question}
              </span>
            ))}
            {conversation.suggested_questions.length > 2 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{conversation.suggested_questions.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {(onDelete || onRename) && (
          <button
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              // 这里可以添加下拉菜单逻辑
            }}
          >
            <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* 激活状态指示器 */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg" />
      )}
    </div>
  )
}

export default memo(ConversationItem)