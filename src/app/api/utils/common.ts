import type { NextRequest } from 'next/server'
import { ChatClient } from '@/lib/client'
import { v4 } from 'uuid'
import { API_KEY, API_URL } from '@/config'
import { USERID_COOKIE_NAME } from '@/config'

export const getInfo = (request: NextRequest) => {
  const sessionId = request.cookies.get('session_id')?.value || v4()

  // const user = request.cookies.get(USERID_COOKIE_NAME)?.value || ''
  console.log('request.cookies.get(USERID_COOKIE_NAME)?.value', request.cookies.get(USERID_COOKIE_NAME)?.value || '')
  const user = '4707011993'
  console.log('All cookies:', request.cookies)
  console.log('USERID_COOKIE_NAME:', USERID_COOKIE_NAME)
  console.log('getInfo user', user)
  return {
    sessionId,
    user,
  }
}

export const setSession = (sessionId: string) => {
  return { 'Set-Cookie': `session_id=${sessionId}` }
}

export const client = new ChatClient(API_KEY, API_URL || undefined)
