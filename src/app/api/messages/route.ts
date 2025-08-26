import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession } from '@/app/api/utils/common'

function getValidParam(param: string | null): string | undefined {
  return param && param !== 'undefined' ? param : undefined
}

export async function GET(request: NextRequest) {
  const { sessionId, user } = getInfo(request)
  const { searchParams } = new URL(request.url)
  const conversationId = getValidParam(searchParams.get('conversation_id'))
  const first_id = getValidParam(searchParams.get('first_id'))
  const limit = searchParams.get('limit')
  // console.log('GET first_id', first_id)
  console.log('GET conversationId', conversationId)
  console.log('GET first_id', first_id)
  console.log('GET limit', limit)

  const { data }: any = await client.getConversationMessages(user, conversationId as string, limit, first_id)
  console.log('data', data)
  return NextResponse.json(data, {
    headers: setSession(sessionId),
  })
}
