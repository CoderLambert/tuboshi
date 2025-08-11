"use client";

import { useState } from "react";
import Link from "next/link";

export default function FileUpload() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('请选择文件');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('请求URL:', '/api/file-upload');
      console.log('文件信息:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });

      // TODO: 建议在 src/services/index.ts 中封装 fileUpload 方法
      // 这里暂时保留 fetch，如需可补充 service 方法
      const response = await fetch('/api/file-upload', {
        method: 'POST',
        body: formData,
      });
      
      console.log('响应状态:', response.status);
      console.log('响应头:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('错误响应内容:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.text();
      setResponse(data);
      console.log('文件上传响应:', data);
    } catch (error) {
      console.error('文件上传失败:', error);
      setError(error instanceof Error ? error.message : '文件上传失败');
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
          <h1 className="text-2xl font-bold">文件上传测试</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="prose flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-medium mb-1">选择文件:</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                已选择: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={loading || !selectedFile}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '上传中...' : '上传文件'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-3xl">
            <h3 className="font-bold mb-2">错误:</h3>
            <p className="text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}
        
        {response && (
          <div className="prose mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">上传结果:</h3>
            <p className="text-sm overflow-auto max-w-3xl">
              {response}
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 