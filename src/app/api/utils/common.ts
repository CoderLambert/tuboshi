import type { NextRequest } from 'next/server'
import { ChatClient } from '@/lib/client'
import { v4 } from 'uuid'
import { GPT_CONFIG_COOKIE_NAME } from '@/config'
import { USERID_COOKIE_NAME } from '@/config'
import { cookies } from 'next/headers'
import { decrypt, shouldEncrypt } from '@/lib/browser-cookie'
import { InternalServerError, errorMessages } from '@/app/api/utils/errorHandler'
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

export const getClient = async (request: NextRequest): Promise<ChatClient> => {
  const cookieStore = await cookies()
  console.log('cookieStore', cookieStore.getAll())

  const encryptGptConfig = cookieStore.get(GPT_CONFIG_COOKIE_NAME)?.value
  console.log('encryptGptConfig', encryptGptConfig)

  if (!encryptGptConfig) {
    console.error('Missing GPT_CONFIG from cookies, generating fallback (may fail)')
    throw new Error('invalid api key or api url')
  }
  const gptConfig = shouldEncrypt(GPT_CONFIG_COOKIE_NAME) ? decrypt(encryptGptConfig) : encryptGptConfig

  console.log('gptConfig', gptConfig)

  if(!gptConfig) {
    throw new InternalServerError(errorMessages.invalid_gpt_config)
  }

  try {
    const gptConfigData = JSON.parse(gptConfig)

    if (!gptConfigData.app_key || !gptConfigData.api_url) {
      throw new InternalServerError(errorMessages.invalid_gpt_config)
    }

    console.log('clientPromise real key', gptConfigData.app_key)
    return new ChatClient(gptConfigData.app_key, gptConfigData.api_url)
  }
  catch (error) {
    console.error('Error parsing GPT_CONFIG from cookies:', error)
    throw new InternalServerError(errorMessages.invalid_gpt_config)
  }
}

export function getValidParam(param: string | null): string | undefined {
  return param && param !== 'undefined' ? param : undefined
}
