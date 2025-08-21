import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest, { params }: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = await params
  const { user } = getInfo(request)
  const res = await client.stopChatMessage(taskId, user)
  return NextResponse.json(res.data)
}
