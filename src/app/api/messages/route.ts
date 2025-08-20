import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession } from '@/app/api/utils/common'

export async function GET(request: NextRequest) {
  const { sessionId, user } = getInfo(request)
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversation_id')
  const first_id = searchParams.get('first_id')
  const limit = searchParams.get('limit')
  const { data }: any = await client.getConversationMessages(user, conversationId as string, limit, first_id)
  return NextResponse.json(data, {
    headers: setSession(sessionId),
  })
}
