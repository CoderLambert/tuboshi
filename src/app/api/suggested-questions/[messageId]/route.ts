import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getClient, getInfo, getValidParam, setSession } from '@/app/api/utils/common'

export async function GET(request: NextRequest, { params }: {
  params: Promise<{ messageId: string }>
}) {
  const { searchParams } = new URL(request.url)
  const { sessionId, user } = getInfo(request)
  const { messageId } = await params
  const userID = getValidParam(searchParams.get('userID'))
  const client = await getClient(request)
  const { data }: any = await client.fetchSuggestedQuestions(messageId, userID || user)

  return NextResponse.json(data, {
    headers: setSession(sessionId),
  })
}
