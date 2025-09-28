import type { NextRequest } from 'next/server'
import { getClient, getInfo } from '@/app/api/utils/common'
import { NextResponse } from 'next/server'
import { errorHandler } from '../utils/errorHandler'
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const { user } = getInfo(request)
    formData.append('user', user)
    const client = await getClient(request)

    const { data } = await client.audioToText(formData)
    return NextResponse.json(data)
  }
  catch (e: any) {
    return errorHandler(e)
  }
}
