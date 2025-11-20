/**
 * 会话管理相关的 API 服务
 */
import { del, post } from './base'
import Toast from '@/app/components/base/toast'

/**
 * 重命名会话（支持乐观更新）
 * @param conversationId 会话 ID
 * @param newName 新的会话名称
 * @param onOptimisticUpdate 乐观更新回调函数
 * @returns Promise<boolean> 操作是否成功
 */
export async function renameConversationApi(
  conversationId: string,
  newName: string,
  onOptimisticUpdate?: (conversationId: string, newName: string) => void
): Promise<boolean> {
  // 乐观更新：立即更新UI
  if (onOptimisticUpdate) {
    onOptimisticUpdate(conversationId, newName)
  }

  try {
    const data = await post(`conversations/${conversationId}/name`, {
      body: {
        name: newName,
        auto_generate: false,
      },
    })

    console.log('Conversation renamed successfully:', data)

    Toast.notify({
      type: 'success',
      message: '会话重命名成功',
    })

    return true
  }
  catch (error) {
    console.error('Failed to rename conversation:', error)
    Toast.notify({
      type: 'error',
      message: error instanceof Error ? error.message : '重命名会话失败',
    })

    // 如果API调用失败，需要回滚乐观更新
    // 这由调用方处理，因为我们需要原始数据来回滚
    return false
  }
}

/**
 * 删除会话
 * @param conversationId 会话 ID
 * @returns Promise<boolean> 操作是否成功
 */
export async function deleteConversationApi(conversationId: string): Promise<boolean> {
  try {
    const data = await del(`conversations/${conversationId}`)
    console.log('Conversation deleted successfully:', data)

    Toast.notify({
      type: 'success',
      message: '会话删除成功',
    })

    return true
  }
  catch (error) {
    console.error('Failed to delete conversation:', error)
    Toast.notify({
      type: 'error',
      message: error instanceof Error ? error.message : '删除会话失败',
    })
    return false
  }
}
