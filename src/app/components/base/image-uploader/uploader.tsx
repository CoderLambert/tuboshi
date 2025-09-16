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

const Uploader: FC<UploaderProps> = ({
  children,
  onUpload,
  limit,
  disabled,
}) => {
  const [hovering, setHovering] = useState(false)
  const { notify } = Toast
  const { t } = useTranslation()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      console.log('[Uploader] 未选择文件')
      return
    }

    if (limit && file.size > limit * 1024 * 1024) {
      console.warn(`[Uploader] 文件超出大小限制: ${file.size} bytes`)
      notify({
        type: 'error',
        message: t('common.imageUploader.uploadFromComputerLimit', { size: limit }),
      })
      return
    }

    let previewUrl = ''

    try {
      // ✅ 优先使用 ObjectURL
      if (window.URL && window.URL.createObjectURL) {
        previewUrl = URL.createObjectURL(file)
        console.log('[Uploader] 使用 ObjectURL 生成预览:', previewUrl)

        const imageFile: ImageFile = {
          type: TransferMethod.local_file,
          _id: `${Date.now()}`,
          fileId: '',
          file,
          url: previewUrl,
          base64Url: previewUrl, // 不再依赖 base64
          progress: 0,
        }

        onUpload(imageFile)

        imageUpload({
          file: imageFile.file,
          onProgressCallback: (progress) => {
            console.log(`[Uploader] 上传进度: ${progress}%`)
            onUpload({ ...imageFile, progress })
          },
          onSuccessCallback: (res) => {
            console.log('[Uploader] 上传成功:', res)
            onUpload({ ...imageFile, fileId: res.id, progress: 100 })
            // URL.revokeObjectURL(previewUrl) // ✅ 释放资源
          },
          onErrorCallback: (err) => {
            console.error('[Uploader] 上传失败:', err)
            notify({
              type: 'error',
              message: t('common.imageUploader.uploadFromComputerUploadError'),
            })
            onUpload({ ...imageFile, progress: -1 })
            URL.revokeObjectURL(previewUrl) // ✅ 释放资源
          },
        })
      }
      else {
        // ⚠️ fallback: 旧环境用 FileReader
        console.log('[Uploader] 回退到 FileReader')

        const reader = new FileReader()
        reader.onload = () => {
          const imageFile: ImageFile = {
            type: TransferMethod.local_file,
            _id: `${Date.now()}`,
            fileId: '',
            file,
            url: reader.result as string,
            base64Url: reader.result as string,
            progress: 0,
          }

          onUpload(imageFile)

          imageUpload({
            file: imageFile.file,
            onProgressCallback: (progress) => {
              onUpload({ ...imageFile, progress })
            },
            onSuccessCallback: (res) => {
              onUpload({ ...imageFile, fileId: res.id, progress: 100 })
            },
            onErrorCallback: (err) => {
              console.error('[Uploader] 上传失败:', err)
              notify({
                type: 'error',
                message: t('common.imageUploader.uploadFromComputerUploadError'),
              })
              onUpload({ ...imageFile, progress: -1 })
            },
          })
        }
        reader.onerror = (err) => {
          console.error('[Uploader] FileReader 读取失败:', err)
          notify({
            type: 'error',
            message: t('common.imageUploader.uploadFromComputerReadError'),
          })
        }
        reader.readAsDataURL(file)
      }
    }
    catch (err) {
      console.error('[Uploader] 未知错误:', err)
      notify({
        type: 'error',
        message: t('common.imageUploader.uploadFromComputerReadError'),
      })
    }
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
