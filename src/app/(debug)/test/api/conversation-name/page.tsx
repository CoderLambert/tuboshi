"use client";

import { useState } from "react";
import Link from "next/link";
import { generationConversationName } from '@/services';

export default function ConversationName() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [conversationId, setConversationId] = useState("");
  const [name, setName] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId) {
      setError('请输入对话ID');
      return;
    }

    if (!autoGenerate && !name) {
      setError('请输入对话名称或选择自动生成');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      let data;
      if (autoGenerate) {
        console.log('请求URL:', `/api/conversations/${conversationId}/name (auto_generate)`);
        data = await generationConversationName(conversationId);
      } else {
        // 保留原有 fetch 逻辑（如需可补充 service 方法）
        const requestBody = { name, auto_generate: false };
        console.log('请求URL:', `/api/conversations/${conversationId}/name`);
        console.log('请求体:', requestBody);
        const response = await fetch(`/api/conversations/${conversationId}/name`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        data = await response.json();
      }
      setResponse(data);
      console.log('重命名对话响应:', data);
    } catch (error) {
      console.error('重命名对话失败:', error);
      setError(error instanceof Error ? error.message : '重命名对话失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-3xl">
        <div className="flex items-center gap-4">
          <Link 
            href="/test/api"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← 返回API测试列表
          </Link>
          <h1 className="text-2xl font-bold">对话重命名测试</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-medium mb-1">对话ID:</label>
            <input
              type="text"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              placeholder="请输入对话ID"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">对话名称:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入对话名称"
              disabled={autoGenerate}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoGenerate"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="autoGenerate" className="text-sm">
              自动生成名称
            </label>
          </div>
          
          <button 
            type="submit"
            disabled={loading || !conversationId || (!autoGenerate && !name)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '重命名中...' : '重命名对话'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-3xl">
            <h3 className="font-bold mb-2">错误:</h3>
            <p className="text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}
        
        {response && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">重命名结果:</h3>
            <pre className="text-sm overflow-auto max-w-3xl">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
} 