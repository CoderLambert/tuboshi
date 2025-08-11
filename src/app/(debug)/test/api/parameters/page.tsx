"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { fetchAppParams } from '@/services';
import { Button } from "@/components/ui/button";
export default function Parameters() {
  const [parameters, setParameters] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setParameters(null);
    
    try {
      console.log('请求URL:', '/api/parameters');
      const data = await fetchAppParams();
      setParameters(data);
      console.log('获取的参数:', data);
    } catch (error) {
      console.error('获取参数失败:', error);
      setError(error instanceof Error ? error.message : '获取参数失败');
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
          <h1 className="text-2xl font-bold">参数获取测试</h1>
        </div>
        
        <Button 
          onClick={handleClick}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '获取中...' : '获取参数'}
        </Button>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-3xl">
            <h3 className="font-bold mb-2">错误:</h3>
            <p className="text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}
        
        {parameters && (
          <div className="prose mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">获取到的参数:</h3>
            <pre className="text-sm overflow-auto max-w-3xl">
              {JSON.stringify(parameters, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
