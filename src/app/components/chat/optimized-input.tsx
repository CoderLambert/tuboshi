'use client'
import type { FC } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
// import Textarea from 'rc-textarea' // 使用原生textarea
import s from './style.module.css'
import type { VisionFile, VisionSettings } from '@/types/app'
import Tooltip from '@/app/components/base/tooltip'
import ChatImageUploader from '@/app/components/base/image-uploader/chat-image-uploader'
import ImageList from '@/app/components/base/image-uploader/image-list'
import { useImageFiles } from '@/app/components/base/image-uploader/hooks'

export type IOptimizedInputProps = {
  onSend: (message: string, files: VisionFile[]) => void
  onStop?: () => void
  checkCanSend?: () => boolean
  visionConfig?: VisionSettings
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
  initialQuery = '',
}) => {
  const { t } = useTranslation()
  const isUseInputMethod = useRef(false)

  // 本地状态，用于即时显示用户输入
  const [localQuery, setLocalQuery] = useState(initialQuery || '')
  const queryRef = useRef(initialQuery || '')

  // 调试日志
  console.log('OptimizedInput render:', { localQuery, initialQuery })

  const {
    files,
    onUpload,
    onRemove,
    onReUpload,
    onImageLinkLoadError,
    onImageLinkLoadSuccess,
    onClear,
  } = useImageFiles()

  // 同步外部初始值变化（如果需要的话）
  useEffect(() => {
    if (initialQuery && initialQuery !== localQuery) {
      setLocalQuery(initialQuery)
      queryRef.current = initialQuery
    }
  }, [initialQuery, localQuery])

  const handleContentChange = useCallback((e: any) => {
    const value = e.target.value
    console.log('handleContentChange called:', value)

    // 立即更新本地状态，保证输入响应性
    setLocalQuery(value)
    queryRef.current = value

    // 完全移除实时外部状态同步，避免频繁重渲染
    // 外部组件可以通过ref或其他方式在需要时获取当前值
  }, [])

  const handleSend = useCallback(() => {
    if (isResponding)
      return

    const currentQuery = queryRef.current
    if (!currentQuery.trim() || (checkCanSend && !checkCanSend()))
      return

    onSend(currentQuery, files.filter(file => file.progress !== -1).map(fileItem => ({
      type: 'image',
      transfer_method: fileItem.type,
      url: fileItem.url,
      upload_file_id: fileItem.fileId,
    })))

    // 发送后清空本地状态
    setLocalQuery('')
    queryRef.current = ''

    if (files.length)
      onClear()
  }, [isResponding, checkCanSend, onSend, files, onClear])

  const handleStop = useCallback(() => {
    if (onStop)
      onStop()
  }, [onStop])

  const handleButtonClick = useCallback(() => {
    if (isResponding)
      handleStop()
    else
      handleSend()
  }, [isResponding, handleStop, handleSend])

  const handleKeyUp = useCallback((e: any) => {
    if (e.code === 'Enter') {
      e.preventDefault()
      if (!e.shiftKey && !isUseInputMethod.current && !isResponding)
        handleSend()
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

  return (
    <div className='relative max-h-[300px] overflow-y-auto rounded-[24px] border-[3px] border-gray-200 bg-white p-[11px]'>
      {
        visionConfig?.enabled && (
          <>
            <div className='absolute bottom-2 left-2 flex items-center'>
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
      <textarea
        className={`
          mt-2 block max-h-none w-full resize-none appearance-none px-2 py-[7px] pr-[118px] text-sm leading-5 text-gray-700 outline-none
          ${visionConfig?.enabled && 'pl-12'}
          ${isResponding ? 'cursor-not-allowed opacity-60' : ''}
        `}
        value={localQuery}
        onChange={handleContentChange}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        disabled={isResponding}
        placeholder={isResponding ? t('app.errorMessage.waitForResponse') : '请输入消息...'}
        rows={1}
      />
      <div className="absolute bottom-2 right-2 flex h-8 items-center">
        <div className={`${s.count} mr-4 h-5 bg-gray-50 text-sm leading-5 text-gray-500`}>
          {localQuery.trim().length}
        </div>
        <Tooltip
          popupContent={
            <div>
              {isResponding ? (
                <div>{t('app.generation.stop')}</div>
              ) : (
                <>
                  <div>{t('common.operation.send')} Enter</div>
                  <div>{t('common.operation.lineBreak')} Shift Enter</div>
                </>
              )}
            </div>
          }
        >
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
        </Tooltip>
      </div>
    </div>
  )
}

export default React.memo(OptimizedInput)
