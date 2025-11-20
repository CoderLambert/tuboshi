'use client'
import type { FC } from 'react'
import React, { memo, useEffect, useRef, useState } from 'react'
import 'dayjs/locale/zh-cn'
import type { IConversationItem as ConversationItemType } from '@/types/app'
import { ChatBubbleLeftRightIcon, CheckIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import cn from 'clsx'
import { Input } from '@/components/ui/input'

export type IConversationItemProps = {
  conversation: ConversationItemType
  isActive?: boolean
  onClick?: () => void
  onDelete?: (conversationId: string) => void
  onRename?: (conversationId: string, newName: string) => void
  isRenaming?: boolean // 新增：是否正在重命名
  className?: string
}

const ConversationItem: FC<IConversationItemProps> = ({
  conversation,
  isActive = false,
  onClick,
  onDelete,
  onRename,
  isRenaming = false,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editingName, setEditingName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 处理会话名称显示
  const displayName = conversation.name
    || (conversation.introduction
      ? conversation.introduction.substring(0, 30) + (conversation.introduction.length > 30 ? '...' : '')
      : '新会话')

  // 当开始编辑时，设置当前名称并聚焦输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

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
    setIsEditing(true)
    setEditingName(conversation.name || displayName)
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    const trimmedName = editingName.trim()
    if (trimmedName && trimmedName !== conversation.name) {
      onRename?.(conversation.id, trimmedName)
    }
    setIsEditing(false)
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(false)
    setEditingName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave(e as any)
    }
    else if (e.key === 'Escape') {
      handleCancel(e as any)
    }
  }

  return (
    <div
      className={cn(
        'group relative flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all duration-200',
        'hover:bg-gray-50 active:bg-gray-100',
        isActive && 'border border-blue-200 bg-blue-50',
        className,
      )}
      onClick={handleClick}
    >
      {/* 会话图标 */}
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
        isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600',
      )}>
        <ChatBubbleLeftRightIcon className="h-5 w-5" />
      </div>

      {/* 会话信息 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          {isEditing ? (
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <Input
                ref={inputRef}
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-7 px-2 py-1 text-sm font-medium"
                placeholder="请输入会话名称"
                onClick={e => e.stopPropagation()}
              />
              <button
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-90',
                  editingName.trim()
                    ? 'text-green-500 hover:bg-green-50 active:bg-green-500 active:text-white'
                    : 'cursor-not-allowed text-gray-300',
                )}
                onClick={editingName.trim() ? handleSave : undefined}
                title="保存修改"
                disabled={!editingName.trim()}
              >
                <CheckIcon className="h-3.5 w-3.5" />
              </button>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-50 active:scale-90 active:bg-gray-500 active:text-white"
                onClick={handleCancel}
                title="取消编辑"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <h3 className={cn(
                'truncate text-sm font-medium',
                isActive ? 'text-blue-900' : 'text-gray-900',
              )}>
                {displayName}
              </h3>

              {/* 操作按钮组 */}
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-90',
                    isRenaming
                      ? 'text-gray-400 cursor-not-allowed'
                      : onRename
                        ? 'text-blue-500 hover:bg-blue-50 active:bg-blue-500 active:text-white'
                        : 'cursor-not-allowed text-gray-300',
                  )}
                  onClick={onRename && !isRenaming ? handleRename : undefined}
                  title={isRenaming ? '正在重命名...' : '重命名会话'}
                  disabled={!onRename || isRenaming}
                >
                  {isRenaming ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border border-gray-400 border-t-transparent" />
                  ) : (
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-90',
                    onDelete
                      ? 'text-red-500 hover:bg-red-50 active:bg-red-500 active:text-white'
                      : 'cursor-not-allowed text-gray-300',
                  )}
                  onClick={onDelete ? handleDelete : undefined}
                  title="删除会话"
                  disabled={!onDelete}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* 会话介绍或最后一条消息预览 */}
        {conversation.introduction && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {conversation.introduction}
          </p>
        )}

        {/* 建议问题预览 */}
        {conversation.suggested_questions && conversation.suggested_questions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {conversation.suggested_questions.slice(0, 2).map((question, index) => (
              <span
                key={index}
                className="inline-block truncate rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                style={{ maxWidth: '120px' }}
              >
                {question}
              </span>
            ))}
            {conversation.suggested_questions.length > 2 && (
              <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                +{conversation.suggested_questions.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 激活状态指示器 */}
      {isActive && (
        <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-lg bg-blue-600" />
      )}
    </div>
  )
}

export default memo(ConversationItem)
