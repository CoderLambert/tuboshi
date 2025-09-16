'use client'

import type { ChangeEvent, FC, JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { imageUpload } from './utils'
import type { ImageFile } from '@/types/app'
import { TransferMethod } from '@/types/app'
import Toast from '@/app/components/base/toast'

type UploaderProps = {
  children: (hovering: boolean) => JSX.Element
  onUpload: (imageFile: ImageFile) => void
  limit?: number
  disabled?: boolean
}

const MAX_CANVAS_SIZE = 1080
const COMPRESS_THRESHOLD = 2 * 1024 * 1024 // >2MB 压缩

const Uploader: FC<UploaderProps> = ({
  children,
  onUpload,
  limit,
  disabled,
}) => {
  const [hovering, setHovering] = useState(false)
  const { notify } = Toast
  const { t } = useTranslation()

  function getSafePreviewUrl(file: File, cb: (url: string) => void) {
    if (window.URL && URL.createObjectURL) {
      try {
        const blobUrl = URL.createObjectURL(file)
        console.log('blobUrl', blobUrl)
        const testImg = new Image()
        testImg.onload = () => cb(blobUrl)
        testImg.onerror = () => {
          console.warn('[Uploader] blob URL 显示失败，回退 base64')
          URL.revokeObjectURL(blobUrl)
          readAsBase64(file, cb)
        }
        testImg.src = blobUrl
        return
      }
      catch (err) {
        console.error('[Uploader] createObjectURL 出错:', err)
      }
    }
    readAsBase64(file, cb)
  }

  function readAsBase64(file: File, cb: (url: string) => void) {
    const reader = new FileReader()
    reader.onload = () => cb(reader.result as string)
    reader.onerror = (err) => {
      console.error('[Uploader] FileReader 出错:', err)
      cb('')
    }
    reader.readAsDataURL(file)
  }

  /** ✅ Canvas 压缩 + blob URL */
  function compressWithCanvas(file: File, cb: (url: string) => void) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > MAX_CANVAS_SIZE) {
          height *= MAX_CANVAS_SIZE / width
          width = MAX_CANVAS_SIZE
        }
        else if (height > MAX_CANVAS_SIZE) {
          width *= MAX_CANVAS_SIZE / height
          height = MAX_CANVAS_SIZE
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)

        // 转 blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const blobUrl = URL.createObjectURL(blob)
              cb(blobUrl)
            }
            else {
              console.warn('[Uploader] canvas.toBlob 失败，回退 base64')
              readAsBase64(file, cb)
            }
          },
          'image/jpeg',
          0.8,
        )
      }
      img.onerror = () => {
        console.error('[Uploader] 压缩失败，回退 base64')
        readAsBase64(file, cb)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('==== file =====')
    console.log(file)
    if (!file) { return }

    if (limit && file.size > limit * 1024 * 1024) {
      notify({
        type: 'error',
        message: t('common.imageUploader.uploadFromComputerLimit', { size: limit }),
      })
      return
    }

    const previewHandler = file.size > COMPRESS_THRESHOLD
      ? compressWithCanvas
      : getSafePreviewUrl

    previewHandler(file, (previewUrl) => {
      if (!previewUrl) {
        notify({
          type: 'error',
          message: t('common.imageUploader.uploadFromComputerReadError'),
        })
        return
      }

      const imageFile: ImageFile = {
        type: TransferMethod.local_file,
        _id: `${Date.now()}`,
        fileId: '',
        file,
        url: previewUrl,
        base64Url: previewUrl,
        progress: 0,
      }

      onUpload(imageFile)

      imageUpload({
        file: imageFile.file,
        onProgressCallback: progress => onUpload({ ...imageFile, progress }),
        onSuccessCallback: res => onUpload({ ...imageFile, fileId: res.id, url: res.preview_url, progress: 100 }),
        onErrorCallback: (err) => {
          console.log('++++++++  imageUpload error +++++++++')
          console.error(err)
          notify({
            type: 'error',
            message: t('common.imageUploader.uploadFromComputerUploadError'),
          })
          onUpload({ ...imageFile, progress: -1 })
          if (previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
          }
        },
      })
    })
  }

  return (
    <div
      className='relative'
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {children(hovering)}
      <input
        className={`
          absolute inset-0 block w-full text-[0] opacity-0
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={e => ((e.target as HTMLInputElement).value = '')}
        type='file'
        accept='.png, .jpg, .jpeg, .webp, .gif'
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  )
}

export default Uploader
