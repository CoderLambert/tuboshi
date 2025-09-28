import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getClient, getInfo, setSession } from '@/app/api/utils/common'
import { cookies } from 'next/headers'
import { errorHandler } from '../utils/errorHandler'

export async function GET(request: NextRequest) {
  const { sessionId, user } = getInfo(request)
  try {
    const { searchParams } = new URL(request.url)
    const last_id = searchParams.get('last_id')
    const limit = Number(searchParams.get('limit'))
    const cookieStore = await cookies()

    console.log('==========conversations  start=======')

    console.log('last_id', last_id)
    console.log('limit', limit)
    console.log('cookieStore', cookieStore)
    const client = await getClient(request)

    const { data }: any = await client.getConversations(user, last_id, limit)
    console.log('data', data)
    console.log('==========conversations  end=======')

    return NextResponse.json(data, {
      headers: setSession(sessionId),
    })
  }
  catch (error: any) {
    return errorHandler(error)
  }
}
