import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo, setSession } from '@/app/api/utils/common'

export async function GET(request: NextRequest, { params }: {
  params: Promise<{ messageId: string }>
}) {
  const { sessionId, user } = getInfo(request)
  const { messageId } = await params
  const { data }: any = await client.fetchSuggestedQuestions(messageId, user)

  return NextResponse.json(data, {
    headers: setSession(sessionId),
  })
}
