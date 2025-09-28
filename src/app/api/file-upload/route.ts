import type { NextRequest } from 'next/server'
import { getClient, getInfo } from '@/app/api/utils/common'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const client = await getClient(request)

    console.log('=============file-upload  start============')
    const formData = await request.formData()
    const { user } = getInfo(request)
    formData.append('user',  user)
    const res = await client.fileUpload(formData,  user)
    console.log(`res : ${res}`)
    console.log(`user: ${user}`)
    console.log('=============file-upload  end============')

    return NextResponse.json(res.data as any)
  }
  catch (e: any) {
    console.error(e)
    return new Response(e.message)
  }
}
