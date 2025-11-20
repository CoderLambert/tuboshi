import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getClient, getInfo } from '@/app/api/utils/common'
import { errorHandler } from '@/app/api/utils/errorHandler'

export async function DELETE(request: NextRequest, { params }: {
  params: Promise<{ conversationId: string }> // 修改为 Promise 类型
}) {
  try {
    const { conversationId } = await params
    const { user } = getInfo(request)
    const client = await getClient(request)

    // 删除会话
    const { data } = await client.deleteConversation(conversationId, user)
    return NextResponse.json(data)
  }
  catch (error) {
    return errorHandler(error)
  }
}