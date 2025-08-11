import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { API_KEY, API_URL, APP_ID } from '@/config'

export async function GET(request: NextRequest) {
  try {
    // 返回配置信息，隐藏敏感数据
    const config = {
      api_url: API_URL,
      app_id: APP_ID,
      api_key: API_KEY ? `${API_KEY.substring(0, 8)}...` : '未设置',
      has_api_key: !!API_KEY,
      has_api_url: !!API_URL,
      has_app_id: !!APP_ID,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(config)
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 