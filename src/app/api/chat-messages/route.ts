import type { NextRequest } from 'next/server'
import { getClient, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    inputs,
    query,
    files,
    conversation_id: conversationId,
    response_mode: responseMode,
  } = body
  const { user } = getInfo(request)
  const isStreaming = responseMode === 'streaming'

  console.log('===========chat message start===========')
  console.log(`inputs: ${JSON.stringify(inputs)}`)
  console.log(`query: ${query}`)
  console.log(`files: ${JSON.stringify(files)}`)
  console.log(`conversationId: ${conversationId}`)
  console.log(`responseMode: ${responseMode}`)
  console.log(`user: ${JSON.stringify(user)}`)
  console.log('===========chat message end===========')
  try {
    const client = await getClient()
    const res = await client.createChatMessage(inputs, query, user, responseMode, conversationId, files)
    if (isStreaming) {
      const headers = new Headers({
        ...(res.headers as Record<string, string>),
        'Content-Type': 'text/event-stream',
      })
      return new Response(res.data as any, {
        headers,
      })
    }
    else { return new Response(res.data as any) }
  }
  catch (e: any) {
    console.log(e)
    return new Response(e.message)
  }
}
