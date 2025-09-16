import type { NextRequest } from 'next/server'
import { getClient, getInfo, getValidParam } from '@/app/api/utils/common'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const client = await getClient(request)

    console.log('=============file-upload  start============')
    const { searchParams } = new URL(request.url)
    const userID = getValidParam(searchParams.get('userID'))

    const formData = await request.formData()
    const { user } = getInfo(request)
    formData.append('user', userID || user)
    const res = await client.fileUpload(formData, userID || user)
    console.log(`res : ${res}`)
    console.log(`userID: ${userID}   user: ${user}`)
    console.log('=============file-upload  end============')

    return NextResponse.json(res.data as any)
  }
  catch (e: any) {
    console.error(e)
    return new Response(e.message)
  }
}
