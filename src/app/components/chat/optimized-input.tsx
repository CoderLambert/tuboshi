'use client'
import type { FC } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Textarea from 'rc-textarea' // 使用原生textarea
import type { ChatConfig, VisionFile, VisionSettings } from '@/types/app'
import ChatImageUploader from '@/app/components/base/image-uploader/chat-image-uploader'
import ImageList from '@/app/components/base/image-uploader/image-list'
import { useImageFiles } from '@/app/components/base/image-uploader/hooks'
import { useBoolean } from 'ahooks'
import Recorder from 'js-audio-recorder'
import Toast from '@/app/components/base/toast'
import s from './style.module.css'
import VoiceInput from '@/app/components/base/voice-input'

export type IOptimizedInputProps = {
  onSend: (message: string, files: VisionFile[]) => void
  onStop?: () => void
  checkCanSend?: () => boolean
  visionConfig?: VisionSettings
  chatConfig?: ChatConfig
  isResponding?: boolean
  initialQuery?: string
}

// 移除防抖Hook，使用useRef避免重渲染

const OptimizedInput: FC<IOptimizedInputProps> = ({
  onSend,
  onStop,
  checkCanSend,
  visionConfig,
  isResponding,
  chatConfig,
  initialQuery = '',
}) => {
  const { t } = useTranslation()
  const isUseInputMethod = useRef(false)

  // 本地状态，用于即时显示用户输入
  const [localQuery, setLocalQuery] = useState(initialQuery || '')
  const queryRef = useRef(initialQuery || '')
  const [showVoiceInput, setShowVoiceInput] = useState(false)

  const {
    files,
    onUpload,
    onRemove,
    onReUpload,
    onImageLinkLoadError,
    onImageLinkLoadSuccess,
    onClear,
  } = useImageFiles()

  const [speechToTextEnabled, setSpeechToTextEnabled] = useBoolean(false)
  // 添加语音输入状态
  const [isVoiceInputVisible, setIsVoiceInputVisible] = useState(false)
  // 添加录音权限状态
  const [hasVoicePermission, setHasVoicePermission] = useState(false)

  // 添加上传完成状态检查
  const [isUploading, setIsUploading] = useState(false)

  const handleContentChange = useCallback((e: any) => {
    const value = e.target.value
    console.log('handleContentChange called:', value)

    // 立即更新本地状态，保证输入响应性
    setLocalQuery(value)
    queryRef.current = value

    // 完全移除实时外部状态同步，避免频繁重渲染
    // 外部组件可以通过ref或其他方式在需要时获取当前值
  }, [])
  // 同步外部初始值变化（如果需要的话）
  useEffect(() => {
    if (initialQuery && initialQuery !== localQuery) {
      setLocalQuery(initialQuery)
      queryRef.current = initialQuery
    }
  }, [initialQuery, localQuery])

  // 监听文件上传状态变化
  useEffect(() => {
    const uploading = files.some(file => file.progress < 100 && file.progress !== -1)
    console.log('uploading:', uploading)
    console.log('files:', files)
    setIsUploading(uploading)
  }, [files])

  useEffect(() => {
    console.log('chatConfig useEffect triggered:', chatConfig)
    console.log('speech_to_text config:', chatConfig?.speech_to_text)

    // 当 chatConfig 为 undefined 时，设置为默认值 false
    // 当 chatConfig 有值时，根据实际配置设置
    if(chatConfig?.speech_to_text?.enabled) {
      setSpeechToTextEnabled.setTrue()
      console.log('设置 speechToTextEnabled 为 true')
    }
    else {
      setSpeechToTextEnabled.setFalse()
      console.log('设置 speechToTextEnabled 为 false')
    }

    if(chatConfig?.speech_to_text?.enabled) {
      setShowVoiceInput(true)
      console.log('设置 showVoiceInput 为 true')
    }
    else {
      setShowVoiceInput(false)
      console.log('设置 showVoiceInput 为 false')
    }
  }, [chatConfig, setSpeechToTextEnabled, setShowVoiceInput])

  // 添加录音权限检查逻辑
  useEffect(() => {
    const checkVoicePermission = async () => {
      try {
        // 检查是否支持录音功能
        if (typeof window !== 'undefined' && navigator.mediaDevices) {
          // 尝试获取权限
          await (Recorder as any).getPermission()
          setHasVoicePermission(true)
        }
        else {
          Toast.notify({ type: 'error', message: t('app.voiceInput.notAllow') })
        }
      }
      catch (err) {
        Toast.notify({ type: 'error', message: t('app.voiceInput.notAllow') })
        setHasVoicePermission(false)
      }
    }

    // 只有在启用语音转文字功能时才检查权限
    if (chatConfig?.speech_to_text?.enabled) { checkVoicePermission() }
  }, [chatConfig?.speech_to_text?.enabled, t])

  const handleSend = useCallback(() => {
    console.log('handleSend called')
    const uploading = files.some(file => file.progress < 100 && file.progress !== -1)

    if(uploading) {
      Toast.notify({ type: 'error', message: t('app.chat.uploadImgTip') })
      return
    }

    // 检查是否有上传失败的文件
    const uploadFailed = files.some(file => file.progress === -1)
    if (uploadFailed) {
      Toast.notify({ type: 'error', message: t('app.chat.uploadImgFailed') })
      return
    }

    // 检查是否有未完成上传的文件（额外保险）
    const incompleteUpload = files.some(file => file.progress === 100 && !file.fileId)
    if (incompleteUpload) {
      Toast.notify({ type: 'error', message: t('app.chat.uploadImgWaitInfo') })
      return
    }

    if (isResponding) { return }

    const currentQuery = queryRef.current
    if (!currentQuery.trim() || (checkCanSend && !checkCanSend())) { return }

    // 只发送上传成功的文件
    const validFiles = files
      .filter(file => file.progress === 100 && file.fileId)
      .map(fileItem => ({
        type: 'image',
        transfer_method: fileItem.type,
        url: fileItem.url,
        upload_file_id: fileItem.fileId,
      }))
    onSend(currentQuery, validFiles)

    // onSend(currentQuery, files.filter(file => file.progress !== -1).map(fileItem => ({
    //   type: 'image',
    //   transfer_method: fileItem.type,
    //   url: fileItem.url,
    //   upload_file_id: fileItem.fileId,
    // })))

    // 发送后清空本地状态
    setLocalQuery('')
    queryRef.current = ''

    if (files.length) { onClear() }
  }, [isResponding, checkCanSend, onSend, files, onClear])

  const handleStop = useCallback(() => {
    if (onStop) { onStop() }
  }, [onStop])

  const handleButtonClick = useCallback(() => {
    if (isResponding) { handleStop() }
    else { handleSend() }
  }, [isResponding, handleStop, handleSend])

  const handleKeyUp = useCallback((e: any) => {
    if (e.code === 'Enter') {
      e.preventDefault()
      if (!e.shiftKey && !isUseInputMethod.current && !isResponding) { handleSend() }
    }
  }, [handleSend, isResponding])

  const handleKeyDown = useCallback((e: any) => {
    isUseInputMethod.current = e.nativeEvent.isComposing
    if (e.code === 'Enter' && !e.shiftKey) {
      const result = localQuery.replace(/\n$/, '')
      setLocalQuery(result)
      queryRef.current = result
      e.preventDefault()
    }
  }, [localQuery])

  const handleVoiceInputClick = useCallback(() => {
    console.log('语音输入按钮被点击')
    console.log('当前状态 - isResponding:', isResponding, 'speechToTextEnabled:', speechToTextEnabled, 'showVoiceInput:', showVoiceInput, 'hasVoicePermission:', hasVoicePermission)

    // 直接显示语音输入组件
    setIsVoiceInputVisible(true)
  }, [isResponding, speechToTextEnabled, showVoiceInput, hasVoicePermission])

  // 添加处理语音输入结果的函数
  const handleVoiceInputComplete = useCallback((text: string) => {
    setIsVoiceInputVisible(false)
    if (text) {
      setLocalQuery(text)
      queryRef.current = text
    }
  }, [])

  // 添加取消语音输入的函数
  const handleVoiceInputCancel = useCallback(() => {
    setIsVoiceInputVisible(false)
  }, [])

  return (
    <div className='relative  overflow-y-auto rounded-[24px] border-[3px] border-gray-200 bg-white p-[16px]'>
      {

        visionConfig?.enabled && (
          <>
            <div className='absolute bottom-2 left-2 z-50 flex items-center'>
              <ChatImageUploader
                settings={visionConfig}
                onUpload={onUpload}
                disabled={files.length >= visionConfig.number_limits}
              />
              <div className='mx-1 h-4 w-[1px] bg-black/5' />
            </div>
            <div className='pl-[52px]'>
              <ImageList
                list={files}
                onRemove={onRemove}
                onReUpload={onReUpload}
                onImageLinkLoadSuccess={onImageLinkLoadSuccess}
                onImageLinkLoadError={onImageLinkLoadError}
              />
            </div>
          </>
        )
      }
      <div className="relative">
        <Textarea
          className={`
            mt-2 block max-h-none w-full resize-none appearance-none px-2 py-[7px] pr-[110px] text-sm leading-5 text-gray-700 outline-none
            ${visionConfig?.enabled && 'pl-12'}
            ${isResponding ? 'cursor-not-allowed opacity-60' : ''}
          `}
          value={localQuery}
          onChange={handleContentChange}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          autoSize={{ minRows: 1, maxRows: 5 }}
          disabled={isResponding}
          placeholder={isResponding ? t('app.errorMessage.waitForResponse') : t('app.chat.textInputPlaceholder')}
          rows={1}
        />

        {/* 语音输入组件覆盖在输入框上 */}
        {isVoiceInputVisible && (
          <div className='fixed bottom-[150px] left-0 right-0 z-50 mx-2'>
            <div className="absolute inset-0 right-0 top-0 z-10 overflow-hidden rounded-[20px] py-8">
              <VoiceInput
                onConverted={handleVoiceInputComplete}
                onCancel={handleVoiceInputCancel}
              />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-2 right-2 flex h-8 items-center">
        {/* 添加语音输入按钮 */}
        {
          chatConfig?.speech_to_text && hasVoicePermission && <div className="flex items-center">
            {!isResponding && (speechToTextEnabled || showVoiceInput || hasVoicePermission) && (
              <div
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-gray-100"
                onClick={handleVoiceInputClick}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 11C9.65685 11 11 9.65685 11 8V4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4V8C5 9.65685 6.34315 11 8 11Z" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 6V8C3 11.3137 5.68629 14 9 14" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M13 6V8C13 11.3137 10.3137 14 7 14" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 14V16" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>
        }

        {isResponding ? (
          <div
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-red-500 hover:bg-red-600"
            onClick={handleStop}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="8" height="8" rx="1" fill="white"/>
            </svg>
          </div>
        ) : (
          <div
            className={`${s.sendBtn} h-8 w-8 cursor-pointer rounded-md ${!localQuery.trim() ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={handleButtonClick}
          />
        )}
      </div>
    </div>
  )
}

export default React.memo(OptimizedInput, (prevProps, nextProps) => {
  // 确保 chatConfig 变化时组件会重新渲染
  return (
    prevProps.chatConfig === nextProps.chatConfig
    && prevProps.isResponding === nextProps.isResponding
    && prevProps.visionConfig === nextProps.visionConfig
    && prevProps.initialQuery === nextProps.initialQuery
  )
})
