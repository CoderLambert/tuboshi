import { getClient } from '@/app/api/utils/common'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getInfo } from '@/app/api/utils/common'
import { errorHandler } from '../utils/errorHandler'
// 设置会话的函数
function setSession(sessionId: string) {
  return {
    'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly`,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { sessionId, user } = getInfo(request)
    const client = await getClient(request)
    const { data } = await client.getApplicationParameters(user)
    return NextResponse.json(data as object, {
      headers: setSession(sessionId),
    })
  }
  catch (error) {
    return errorHandler(error)
  }
}
