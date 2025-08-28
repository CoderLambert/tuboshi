import type { NextRequest } from 'next/server'
import { ChatClient } from '@/lib/client'
import { v4 } from 'uuid'
import { API_KEY, API_URL } from '@/config'
import { USERID_COOKIE_NAME } from '@/config'
import { getApiUrl, getAppKey } from '@/config'
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
let clientPromise: Promise<ChatClient> | null = null

export const getClient = async (): Promise<ChatClient> => {
  // 如果已经有缓存的客户端实例，直接返回
  if (cachedClient)
    return cachedClient

  // 如果正在初始化客户端，返回现有的Promise
  if (clientPromise)
    return clientPromise

  // 创建一个新的Promise来初始化客户端
  clientPromise = (async () => {
    const TEST_API_KEY = await getAppKey()
    const TEST_API_URL = await getApiUrl()
    console.log('clientPromise TEST_API_KEY', TEST_API_KEY)
    console.log('clientPromise TEST_API_URL', TEST_API_URL)

    cachedClient = new ChatClient(API_KEY, API_URL || undefined)
    return cachedClient
  })()

  return clientPromise
}

export function getValidParam(param: string | null): string | undefined {
  return param && param !== 'undefined' ? param : undefined
}
