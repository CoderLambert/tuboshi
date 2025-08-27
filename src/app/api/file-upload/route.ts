import type { NextRequest } from 'next/server'
import { client, getInfo, getValidParam } from '@/app/api/utils/common'

export async function POST(request: NextRequest) {
  try {
    console.log('=============file-upload  start============')
    const { searchParams } = new URL(request.url)
    const userID = getValidParam(searchParams.get('userID'))

    const formData = await request.formData()
    const { user } = getInfo(request)
    formData.append('user', userID || user)
    const res = await client.fileUpload(formData, userID || user)
    console.log(`userID: ${userID}   user: ${user}`)
    console.log('=============file-upload  end============')

    return new Response(res.data.id as any)
  }
  catch (e: any) {
    return new Response(e.message)
  }
}
