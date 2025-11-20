'use client'
import { Clock, MessageSquarePlus } from 'lucide-react'
import { useSending } from '@/app/contexts/SendingContext'
import { memo } from 'react'

type HeaderMenuProps = {
  onNewConversation?: () => void
  onShowHistory?: () => void
  showMenu?: boolean
}

// 使用 memo 优化，避免不必要的重新渲染
const HeaderMenu = memo(({ onNewConversation, onShowHistory, showMenu = true }: HeaderMenuProps) => {
  const { isSendingMessage } = useSending()

  return (
    <div className="flex items-center gap-2">
      {/* 新建会话按钮 */}
      <button
        onClick={onNewConversation}
        disabled={isSendingMessage}
        className={`flex h-8 w-8 items-center justify-center transition-transform active:scale-90 ${
          isSendingMessage ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        <MessageSquarePlus className="h-5 w-5 text-gray-700 transition-colors hover:text-gray-900" />
      </button>

      {/* 历史记录按钮 */}
      <button
        onClick={onShowHistory}
        disabled={isSendingMessage}
        className={`flex h-8 w-8 items-center justify-center transition-transform active:scale-90 ${
          isSendingMessage ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        <Clock className="h-5 w-5 text-gray-700 transition-colors hover:text-gray-900" />
      </button>
    </div>
  )
})

HeaderMenu.displayName = 'HeaderMenu'

export default HeaderMenu
