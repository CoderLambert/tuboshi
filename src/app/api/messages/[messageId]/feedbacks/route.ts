import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getClient, getInfo } from '@/app/api/utils/common'
import { errorHandler } from '@/app/api/utils/errorHandler'

export async function POST(request: NextRequest, { params }: {
  params: Promise<{ messageId: string }>
}) {
  try {
    const body = await request.json()
    const {
      rating,
    } = body
    const { messageId } = await params
    const { user } = getInfo(request)
    const client = await getClient(request)

    const { data } = await client.messageFeedback(messageId, rating, user)
    return NextResponse.json(data)
  }
  catch (error) {
    console.error(error)
    return errorHandler(error)
  }
}
