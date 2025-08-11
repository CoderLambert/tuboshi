"use client";

import { useState } from "react";
import Link from "next/link";
import { sendChatMessage } from '@/services';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
export default function ChatMessages() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [inputs, setInputs] = useState("");
  const [query, setQuery] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [responseMode, setResponseMode] = useState("blocking");
  const [files, setFiles] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const requestBody: Record<string, any> = {
        inputs: inputs ? JSON.parse(inputs) : {},
        query,
        files: files ? JSON.parse(files) : [],
        response_mode: responseMode,
      };
      if (conversationId) {
        requestBody.conversation_id = conversationId;
      }
      console.log('请求URL:', '/api/chat-messages');
      console.log('请求体:', requestBody);
      // 适配 sendChatMessage
      let resultData: any = '';
      await sendChatMessage(requestBody, {
        onData: (data: any) => {
          console.log('onData: ', data)
          resultData += typeof data === 'string' ? data : JSON.stringify(data);
          setResponse(resultData)
        },
        onCompleted: (data) => {
          console.log('onCompleted: ', data)

          // setResponse(resultData);
        },
        onFile: () => {},
        onThought: () => {},
        onMessageEnd: (m) => {
          console.log('onMessageEnd: ', m)

        },
        onMessageReplace: (m) => {
          console.log('onMessageReplace: ', m)
        },
        onError: (err: any) => {
          setError(err?.message || '发送聊天消息失败');
        },
        onWorkflowStarted: () => {},
        onNodeStarted: () => {},
        onNodeFinished: () => {},
        onWorkflowFinished: () => {},
      });
      // 如果是阻塞模式，直接 setResponse
      if (responseMode === 'blocking') {
        setResponse(resultData);
      }
      console.log('聊天消息响应:', resultData);
    } catch (error) {
      console.error('发送聊天消息失败:', error);
      setError(error instanceof Error ? error.message : '发送聊天消息失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-sans flex items-center justify-items-center min-h-screen p-8 pb-20">
      <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start w-full max-w-3xl">
        <div className="flex items-center gap-4">
          <Link 
            href="/test/api"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← 返回API测试列表
          </Link>
          <h1 className="text-2xl font-bold">聊天消息测试</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-medium mb-1">输入参数 (JSON格式):</label>
            <Textarea
              value={inputs}
              onChange={(e) => setInputs(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full text-base px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">查询内容:</label>
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="请输入查询内容"
              className="w-full text-base px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">对话ID (可选):</label>
            <Input
              type="text"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              placeholder="对话ID"
              className="w-full text-base px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1">响应模式: { responseMode }</label>
            <select
              value={responseMode}
              onChange={(e) => setResponseMode(e.target.value)}
              className="w-full text-base px-3 py-2 m-0 p-0 border border-gray-300 rounded"
            >
              <option value="blocking">阻塞模式</option>
              <option value="streaming">流式模式</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">文件 (JSON格式):</label>
            <Textarea
              value={files}
              onChange={(e) => setFiles(e.target.value)}
              placeholder='[{"file_id": "xxx"}]'
              className="w-full text-base px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          
          <Button 
            type="submit"
            disabled={loading}
            className="px-4 text-base py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '发送中...' : '发送聊天消息'}
          </Button>
        </form>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-3xl">
            <h3 className="font-bold mb-2">错误:</h3>
            <p className="text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}
        { (
          <div className="mt-4 p-4 bg-gray-100 rounded w-full">
            <h3 className="font-bold text-base mb-2">响应结果:</h3>
            <p className="text-base leading-7 [&:not(:first-child)]:mt-6">
              {response}
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 