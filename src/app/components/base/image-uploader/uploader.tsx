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
  limit?: number // 限制文件大小，单位 MB
  disabled?: boolean
}

// --- 常量定义 ---
const MAX_CANVAS_SIZE = 1080
const COMPRESS_THRESHOLD = 2 * 1024 * 1024 // >2MB 压缩

// ✅ 前端验证常量
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif']
const MAX_FILE_SIZE_MB = 10 // 设置一个硬性的最大文件大小限制，例如 10MB

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

  /**
   * ✅ 完整的前端文件验证函数
   * @param file - 待验证的文件对象
   * @returns {string | null} - 如果验证通过返回 null，否则返回错误信息
   */
  const validateFile = (file: File): string | null => {
    // 1. 检查文件大小 (硬性限制)
    const maxSizeInBytes = MAX_FILE_SIZE_MB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      return t('common.imageUploader.sizeExceeded', { size: MAX_FILE_SIZE_MB }) // 建议在 i18n 中添加此 key
    }

    // 2. 检查 MIME Type (主要验证方式)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return t('common.imageUploader.invalidFileType') // 建议在 i18n 中添加此 key
    }

    // 3. 检查文件扩展名 (辅助验证，防止用户修改 MIME)
    const fileName = file.name.toLowerCase()
    const isValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))
    if (!isValidExtension) {
      return t('common.imageUploader.invalidFileExtension') // 建议在 i18n 中添加此 key
    }

    // 4. 检查通过 props 传入的动态大小限制
    if (limit && file.size > limit * 1024 * 1024) {
      return t('common.imageUploader.uploadFromComputerLimit', { size: limit })
    }

    return null // 验证通过
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) { return }

    // ✅ 1. 执行前端验证
    const errorMessage = validateFile(file)
    if (errorMessage) {
      notify({ type: 'error', message: errorMessage })
      // 清空 input value，允许用户再次选择同一个（错误的）文件
      e.target.value = ''
      return
    }

    // ✅ 2. 验证通过，继续处理文件
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
          console.error('++++++++ imageUpload error +++++++++', err)
          notify({
            type: 'error',
            message: t('common.imageUploader.uploadFromComputerUploadError'),
          })
          onUpload({ ...imageFile, progress: -1 })
          // 清理 blob URL 以释放内存
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
