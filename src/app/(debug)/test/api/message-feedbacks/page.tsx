"use client";

import { useState } from "react";
import Link from "next/link";
import { updateFeedback } from '@/services';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Feedbacktype, MessageRating } from "@/types/app";
export default function MessageFeedbacks() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [messageId, setMessageId] = useState("");
  const [rating, setRating] = useState<MessageRating>("like");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageId) {
      setError('请输入消息ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const requestBody: Feedbacktype = {
        rating,
      };
      
      const url = `/messages/${messageId}/feedbacks`;
      console.log('请求URL:', url);
      console.log('请求体:', requestBody);
      
      const data = await updateFeedback({ url, body: requestBody });
      setResponse(data);
      console.log('消息反馈响应:', data);
    } catch (error) {
      console.error('发送消息反馈失败:', error);
      setError(error instanceof Error ? error.message : '发送消息反馈失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-sans w-full p-2">
      <main className="flex flex-col gap-4 ">
        <div className="flex flex-row items-center gap-4">
          <Link 
            href="/test/api"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← 返回API测试列表
          </Link>
          <h1 className="text-2xl font-bold">消息反馈测试</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="prose flex flex-col justify-start items-start gap-4 w-full">
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">消息ID:</label>
            <Input
              type="text"
              value={messageId}
              onChange={(e) => setMessageId(e.target.value)}
              placeholder="请输入消息ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="w-full flex flex-col gap-2">
            <label className="block text-sm font-medium mb-2">评分:</label>
            <select
              value={rating ?? ""}
              onChange={(e) => setRating(e.target.value as MessageRating)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="like">喜欢</option>
              <option value="dislike">不喜欢</option>
            </select>
          </div>
          
          <Button 
            type="submit"
            disabled={loading || !messageId}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '发送中...' : '发送反馈'}
          </Button>
        </form>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-3xl">
            <h3 className="font-bold mb-2">错误:</h3>
            <p className="text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}
        
        {response && (
          <div className="prose mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">反馈结果:</h3>
            <pre className="text-sm overflow-auto max-w-3xl">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
} 