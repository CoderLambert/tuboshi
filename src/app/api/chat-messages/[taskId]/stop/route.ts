import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getClient, getInfo, getValidParam } from '@/app/api/utils/common'
import { errorHandler } from '@/app/api/utils/errorHandler'

export async function POST(request: NextRequest, { params }: {
  params: Promise<{ taskId: string }>
}) {
  try {
    console.log('=============chat-messages/[taskId]/stop  start============')
    const { taskId } = await params
    const { user } = getInfo(request)
    const { searchParams } = new URL(request.url)
    const userID = getValidParam(searchParams.get('userID'))
    const client = await getClient(request)
    const res = await client.stopChatMessage(taskId, userID || user)
    console.log(`userID ${userID} taskId ${taskId}`)
    console.log('user', user)
    console.log('=============chat-messages/[taskId]/stop  end ============')
    return NextResponse.json(res.data)
  }
  catch (error) {
    console.error(error)
    return errorHandler(error)
  }
}
