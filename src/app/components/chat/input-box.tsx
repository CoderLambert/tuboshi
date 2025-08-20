'use client'
import type { FC } from 'react'
import React, { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Textarea from 'rc-textarea'
import s from './style.module.css'
import type { VisionFile, VisionSettings } from '@/types/app'
import Tooltip from '@/app/components/base/tooltip'
import ChatImageUploader from '@/app/components/base/image-uploader/chat-image-uploader'
import ImageList from '@/app/components/base/image-uploader/image-list'
import { useImageFiles } from '@/app/components/base/image-uploader/hooks'

export type IInputBoxProps = {
  query: string
  onQueryChange: (query: string) => void
  onSend: (message: string, files: VisionFile[]) => void
  onStop?: () => void
  checkCanSend?: () => boolean
  visionConfig?: VisionSettings
  isResponding?: boolean
}

const InputBox: FC<IInputBoxProps> = ({
  query,
  onQueryChange,
  onSend,
  onStop,
  checkCanSend,
  visionConfig,
  isResponding,
}) => {
  const { t } = useTranslation()
  const isUseInputMethod = useRef(false)
  const queryRef = useRef(query)

  const {
    files,
    onUpload,
    onRemove,
    onReUpload,
    onImageLinkLoadError,
    onImageLinkLoadSuccess,
    onClear,
  } = useImageFiles()

  const handleContentChange = useCallback((e: any) => {
    const value = e.target.value
    onQueryChange(value)
    queryRef.current = value
  }, [onQueryChange])

  const handleSend = useCallback(() => {
    if (isResponding) {
      // 如果正在响应中，显示提示
      return
    }

    if (!query.trim() || (checkCanSend && !checkCanSend()))
      return

    onSend(query, files.filter(file => file.progress !== -1).map(fileItem => ({
      type: 'image',
      transfer_method: fileItem.type,
      url: fileItem.url,
      upload_file_id: fileItem.fileId,
    })))

    if (files.length)
      onClear()
  }, [isResponding, query, checkCanSend, onSend, files, onClear])

  const handleStop = () => {
    if (onStop)
      onStop()
  }

  const handleButtonClick = () => {
    if (isResponding)
      handleStop()
     else
      handleSend()
  }

  const handleKeyUp = (e: any) => {
    if (e.code === 'Enter') {
      e.preventDefault()
      if (!e.shiftKey && !isUseInputMethod.current && !isResponding)
        handleSend()
    }
  }

  const handleKeyDown = (e: any) => {
    isUseInputMethod.current = e.nativeEvent.isComposing
    if (e.code === 'Enter' && !e.shiftKey) {
      const result = query.replace(/\n$/, '')
      onQueryChange(result)
      queryRef.current = result
      e.preventDefault()
    }
  }

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
      <Textarea
        className={`
          mt-2 block max-h-none w-full resize-none appearance-none px-2 py-[7px] pr-[118px] text-sm leading-5 text-gray-700 outline-none
          ${visionConfig?.enabled && 'pl-12'}
          ${isResponding ? 'cursor-not-allowed opacity-60' : ''}
        `}
        value={query}
        onChange={handleContentChange}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        autoSize
        disabled={isResponding}
        placeholder={isResponding ? t('app.errorMessage.waitForResponse') : ''}
      />
      <div className="absolute bottom-2 right-2 flex h-8 items-center">
        <div className={`${s.count} mr-4 h-5 bg-gray-50 text-sm leading-5 text-gray-500`}>{query.trim().length}</div>
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
              className={`${s.sendBtn} h-8 w-8 cursor-pointer rounded-md ${!query.trim() ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={handleButtonClick}
            />
          )}
        </Tooltip>
      </div>
    </div>
  )
}

export default React.memo(InputBox)
