import { type NextRequest } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

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
  const isStreaming = responseMode === "streaming"
  const res = await client.createChatMessage(inputs, query, user, responseMode, conversationId, files)
  if (isStreaming) {
    const headers = new Headers({
      ...(res.headers as Record<string, string>),
      'Content-Type': 'text/event-stream',
    })
    return new Response(res.data as any, {
      headers,
    })
  } else
    return new Response(res.data as any)
}
