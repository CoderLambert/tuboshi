'use client'

import { upload } from '@/services/base'
import Toast from '@/app/components/base/toast'
export type ImageUploadResult = {
  id: string
  preview_url: string
}
type ImageUploadParams = {
  file: File
  onProgressCallback: (progress: number) => void
  onSuccessCallback: (res: ImageUploadResult) => void
  onErrorCallback: (e: any) => void
}
type ImageUpload = (v: ImageUploadParams) => void

export const imageUpload: ImageUpload = ({
  file,
  onProgressCallback,
  onSuccessCallback,
  onErrorCallback,
}) => {
  const formData = new FormData()
  formData.append('file', file)
  const onProgress = (e: ProgressEvent) => {
    if (e.lengthComputable) {
      const percent = Math.floor(e.loaded / e.total * 100)
      onProgressCallback(percent)
    }
  }

  upload({
    xhr: new XMLHttpRequest(),
    data: formData,
    onprogress: onProgress,
  })
    .then((res: ImageUploadResult) => {
      console.log('======= image-uploader XMLHttpRequest upload ==>')
      console.log(res)
      onSuccessCallback(res)
    })
    .catch((e) => {
      console.error(e)
      // 更好地处理错误信息显示
      let errorMessage = '上传失败，请重试'
      if (typeof e === 'string') {
        errorMessage = e
      }
      else if (e?.message) {
        errorMessage = e.message
      }
      else if (e?.statusText) {
        errorMessage = e.statusText
      }
      else if (typeof e === 'object') {
        errorMessage = '网络连接失败，请检查网络'
      }
      Toast.notify({ type: 'error', message: errorMessage })
      onErrorCallback(e)
    })
}
