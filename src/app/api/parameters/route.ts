import { getClient } from '@/app/api/utils/common'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getInfo } from '@/app/api/utils/common'
import { getValidParam } from '@/app/api/utils/common'

// 模拟获取请求信息的函数

// 模拟设置会话的函数
function setSession(sessionId: string) {
  return {
    'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly`,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const { sessionId, user } = getInfo(request)
  const userID = getValidParam(searchParams.get('userID'))
  console.log('==========parameters  start=======')
  console.log('GET userID', userID)
  console.log('==========parameters  end=======')

  try {
    const client = await getClient(request)
    const { data } = await client.getApplicationParameters(userID || user)
    return NextResponse.json(data as object, {
      headers: setSession(sessionId),
    })
  }
  catch (error) {
    console.error('获取参数失败:', error)
    return NextResponse.json({ error: '获取参数失败' }, { status: 500 })
  }
}
