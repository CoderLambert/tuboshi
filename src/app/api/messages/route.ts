import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getClient, getInfo, setSession } from '@/app/api/utils/common'
import { getValidParam } from '@/app/api/utils/common'
export async function GET(request: NextRequest) {
  const client = await getClient(request)

  const { sessionId, user } = getInfo(request)
  const { searchParams } = new URL(request.url)
  const conversationId = getValidParam(searchParams.get('conversation_id'))
  const first_id = getValidParam(searchParams.get('first_id'))
  const limit = searchParams.get('limit')
  const userID = getValidParam(searchParams.get('userID'))
  // console.log('GET first_id', first_id)
  console.log(' =====================messages  start===================== ')
  console.log('GET conversationId', conversationId)
  console.log('GET first_id', first_id)
  console.log('GET limit', limit)
  console.log('GET userID', userID)
  console.log('GET user', user)
  console.log(' =====================messages  end===================== ')

  const { data }: any = await client.getConversationMessages(userID || user, conversationId as string, limit, first_id)
  console.log('data', data)
  return NextResponse.json(data, {
    headers: setSession(sessionId),
  })
}
