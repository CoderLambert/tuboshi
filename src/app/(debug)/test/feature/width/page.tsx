"use client";

import { useState, useEffect, useRef } from "react";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";

export default function Home() {
  // const [keyboardHeight, setKeyboardHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // const originalHeight = useRef<number>(0); // 初始为空值

  // useEffect(() => {
  //   // 只在客户端执行
  //   originalHeight.current = window.visualViewport?.height || window.innerHeight;

  //   const handleResize = () => {
  //     const currentHeight = window.visualViewport?.height || window.innerHeight;
  //     const heightDiff = originalHeight.current - currentHeight;
  //     setKeyboardHeight(heightDiff > 0 ? heightDiff : 0);
  //   };

  //   const handleFocus = () => {
  //     window.addEventListener('resize', handleResize);
  //     setTimeout(() => {
  //       textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  //     }, 100);
  //   };

  //   const handleBlur = () => {
  //     window.removeEventListener('resize', handleResize);
  //     setKeyboardHeight(0);
  //   };

  //   const textarea = textareaRef.current;
  //   if (textarea) {
  //     textarea.addEventListener('focus', handleFocus);
  //     textarea.addEventListener('blur', handleBlur);
  //   }

  //   // 初始调用
  //   handleResize();

  //   return () => {
  //     if (textarea) {
  //       textarea.removeEventListener('focus', handleFocus);
  //       textarea.removeEventListener('blur', handleBlur);
  //     }
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []); // 空依赖，只在挂载时执行

useEffect(() => {
    const handleResize = () => {
      if (document.activeElement === textareaRef.current) {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full flex flex-col px-[32px]">
      <div className="suggestions text-[38px] leading-[48px] text-[#262222] font-[500]">我是MAOMAO，你的智能助手</div>
      <footer className="absolute bottom-0 flex justify-center bg-chat-input-mask pb-4 max-h-[158px] overflow-auto w-full">
        <textarea
          ref={textareaRef}
          className="w-[452px]"
          placeholder="请输入"
          onFocus={() => {
              textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }}
        />
      </footer>
    </div>
  );
}