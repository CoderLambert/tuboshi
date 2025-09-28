import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getClient, getInfo, setSession } from '@/app/api/utils/common'
import { errorHandler } from '../../utils/errorHandler'

export async function GET(request: NextRequest, { params }: {
  params: Promise<{ messageId: string }>
}) {
  try {
    const { sessionId, user } = getInfo(request)
    const { messageId } = await params
    const client = await getClient(request)
    const { data }: any = await client.fetchSuggestedQuestions(messageId, user)
    return NextResponse.json(data as object, {
      headers: setSession(sessionId),
    })
  }
  catch (error) {
    return errorHandler(error)
  }
}
