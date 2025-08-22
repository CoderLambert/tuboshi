'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import VoiceInput from '@/app/components/base/voice-input'
import { useToastContext } from '@/app/components/base/toast'
import Recorder from 'js-audio-recorder'
import { useTranslation } from 'react-i18next'

export default function VoiceInputTest() {
  const [isRecording, setIsRecording] = useState(false)
  const [convertedText, setConvertedText] = useState('')
  const [status, setStatus] = useState<'idle' | 'recording' | 'converting'>('idle')
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const { notify } = useToastContext()
  const { t } = useTranslation()

  const handleStartRecording = () => {
    setIsRecording(true)
    setStatus('recording')
    setConvertedText('')
  }

  const handleConverted = (text: string) => {
    console.log('handleConverted called with text:', text) // 添加调试日志
    setConvertedText(text)
    setStatus('idle')
    setIsRecording(false)
  }

  const handleCancel = () => {
    console.log('handleCancel called')
    setIsRecording(false)
    setStatus('idle')
    // setConvertedText('')
  }

  useEffect(() => {
    (Recorder as any).getPermission().then(() => {
      setShowVoiceInput(true)
    }, () => {
      notify({ type: 'error', message: t('common.voiceInput.notAllow') })
    })
  }, [t, notify])

  return (
    <div className="w-full p-2 font-sans">
      <main className="flex flex-col gap-4">
        <div className="flex flex-row items-center gap-4">
          <Link
            href="/test"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            ← 返回测试列表
          </Link>
          <h1 className="text-2xl font-bold">语音输入组件测试</h1>
        </div>

        <div className="prose max-w-3xl">
          <p>此页面用于测试语音输入组件的功能。</p>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">测试说明</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>点击"开始录音"按钮启动语音输入</li>
              <li>录制音频最长60秒</li>
              <li>录音结束后会自动转换为文本</li>
              <li>支持手动停止录音</li>
            </ul>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">测试区域</h2>
            <p className="mt-2">权限状态: {showVoiceInput ? '已授权' : '未授权'}</p>
            <p className="mt-2">当前状态: {isRecording ? '正在录制中' : '空闲'}</p>
            <p className="mt-2">转换结果: {convertedText || '无'}</p>
            <div className="mt-4 rounded-lg border bg-gray-50 p-4">
              {!isRecording ? (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    onClick={handleStartRecording}
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    disabled={!showVoiceInput}
                  >
                    开始录音
                  </Button>

                  {status === 'converting' && (
                    <p className="text-gray-600">正在转换音频为文本...</p>
                  )}
                </div>
              ) : (
                <div className="relative h-20">
                  {/* 移除了 showVoiceInput 条件，确保组件在录音时始终渲染 */}
                  <VoiceInput
                    onConverted={handleConverted}
                    onCancel={handleCancel}
                  />
                </div>
              )}

              {convertedText && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900">转换结果:</h3>
                  <div className="mt-2 rounded border bg-white p-3">
                    <p className="text-gray-800">{convertedText}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">状态信息</h2>
            <div className="mt-2 rounded bg-gray-100 p-3">
              <p>当前状态:
                {status === 'idle' && ' 空闲'}
                {status === 'recording' && ' 录音中'}
                {status === 'converting' && ' 转换中'}
              </p>
              {isRecording && (
                <p className="mt-1">提示: 点击录音组件中的停止按钮结束录音</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
