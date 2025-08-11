"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchChatList } from '@/services';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function Messages() {
  const [messages, setMessages] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setMessages(null);
    
    try {
      const url = conversationId 
        ? `/api/messages?conversation_id=${encodeURIComponent(conversationId)}`
        : '/api/messages';
      
      console.log('请求URL:', url);
      
      const data = await fetchChatList(conversationId);
      setMessages(data);
      console.log('获取的消息:', data);
    } catch (error) {
      console.error('获取消息失败:', error);
      setError(error instanceof Error ? error.message : '获取消息失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-sans w-full p-2">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex items-center gap-4">
          <Link 
            href="/test/api"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← 返回API测试列表
          </Link>
          <h1 className="text-2xl font-bold">消息列表测试</h1>
        </div>
        
        <div className="flex flex-col gap-4 w-full max-w-3xl">
          <Input
            type="text"
            placeholder="对话ID (可选)"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            onClick={handleClick}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '获取中...' : '获取消息'}
          </Button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-3xl">
            <h3 className="font-bold mb-2">错误:</h3>
            <p className="text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}
        
        {messages && (
          <div className="prose mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">获取到的消息:</h3>
            <p className="text-sm overflow-auto w-full">
              {JSON.stringify(messages, null, 2)}
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 