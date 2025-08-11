import { client } from '@/app/api/utils/common';
import { NextRequest, NextResponse } from 'next/server';
// 模拟获取请求信息的函数
function getInfo(request: NextRequest) {
  return {
    sessionId: 'session-' + Date.now(),
    user: { id: 'user-' + Math.random().toString(36).substr(2, 9) }
  };
}

// 模拟设置会话的函数
function setSession(sessionId: string) {
  return {
    'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly`
  };
}

export async function GET(request: NextRequest) {
  const { sessionId, user } = getInfo(request);
  
  try {
    const { data } = await client.getApplicationParameters(user);
    return NextResponse.json(data as object, {
      headers: setSession(sessionId),
    });
  } catch (error) {
    console.error('获取参数失败:', error);
    return NextResponse.json({ error: '获取参数失败' }, { status: 500 });
  }
} 