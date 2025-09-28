import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getClient, getInfo } from '@/app/api/utils/common'
import { errorHandler } from '@/app/api/utils/errorHandler'

export async function POST(request: NextRequest, { params }: {
  params: Promise<{ taskId: string }>
}) {
  try {
    console.log('=============chat-messages/[taskId]/stop  start============')
    const { taskId } = await params
    const { user } = getInfo(request)
    const client = await getClient(request)
    const res = await client.stopChatMessage(taskId, user)
    console.log('=============chat-messages/[taskId]/stop  end ============')
    return NextResponse.json(res.data)
  }
  catch (error) {
    console.error(error)
    return errorHandler(error)
  }
}
