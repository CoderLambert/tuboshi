import type { NextRequest } from 'next/server'
import { ChatClient } from '@/lib/client'
import { v4 } from 'uuid'
import { API_KEY } from '@/config'
import { API_KEY_COOKIE_NAME, API_URL, API_URL_COOKIE_NAME, USERID_COOKIE_NAME } from '@/config'
import { cookies } from 'next/headers'
export const getInfo = (request: NextRequest) => {
  const sessionId = request.cookies.get('session_id')?.value || v4()
  console.log('========= getInfo start ============')
  // const user = request.cookies.get(USERID_COOKIE_NAME)?.value || ''
  console.log('request.cookies.get(USERID_COOKIE_NAME)?.value', request.cookies.get(USERID_COOKIE_NAME)?.value || '')
  // const user = '4707011993'
  const user = request.cookies.get(USERID_COOKIE_NAME)?.value || ''
  console.log('USERID_COOKIE_NAME:', USERID_COOKIE_NAME)
  console.log('getInfo user', user)
  console.log('========= getInfo end ============')

  return {
    sessionId,
    user,
  }
}

export const setSession = (sessionId: string) => {
  return { 'Set-Cookie': `session_id=${sessionId}` }
}

// 创建一个异步函数来获取客户端实例
let cachedClient: ChatClient | null = null
// let clientPromise: Promise<ChatClient> | null = null

export const getClient = async (request: NextRequest): Promise<ChatClient> => {
  if (cachedClient) { return cachedClient }
  else {
    const REAL_API_KEY = request.cookies.get(API_KEY_COOKIE_NAME)?.value
    console.log('clientPromise TEST_API_KEY', REAL_API_KEY)
    const REAL_API_URL = request.cookies.get(API_URL_COOKIE_NAME)?.value

    console.log('clientPromise TEST_API_URL', REAL_API_URL)
    const cookieStore = await cookies()
    console.log('cookieStore', cookieStore.getAll())
    if (!REAL_API_KEY || !REAL_API_URL)
      console.warn('Missing API_KEY or API_URL from cookies, generating fallback (may fail)')

    console.log('clientPromise real key', REAL_API_KEY || API_KEY)
    cachedClient = new ChatClient(REAL_API_KEY || API_KEY, REAL_API_URL || API_URL)
    return cachedClient
  }
}

export function getValidParam(param: string | null): string | undefined {
  return param && param !== 'undefined' ? param : undefined
}
