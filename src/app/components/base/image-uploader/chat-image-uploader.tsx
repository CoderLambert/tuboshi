import type { FC } from 'react'
import Uploader from './uploader'
import ImagePlus from '@/app/components/base/icons/src/vender/line/image-plus'
import { TransferMethod } from '@/types/app'

import type { ImageFile, VisionSettings } from '@/types/app'

type UploadOnlyFromLocalProps = {
  onUpload: (imageFile: ImageFile) => void
  disabled?: boolean
  limit?: number
}
const UploadOnlyFromLocal: FC<UploadOnlyFromLocalProps> = ({
  onUpload,
  disabled,
  limit,
}) => {
  return (
    <Uploader onUpload={onUpload} disabled={disabled} limit={limit}>
      {
        hovering => (
          <div className={`
            relative flex h-8 w-8 cursor-pointer items-center justify-center
            ${hovering && 'bg-gray-100'}
          `}>
            <ImagePlus className='h-4 w-4 text-gray-500' />
          </div>
        )
      }
    </Uploader>
  )
}

type UploaderButtonProps = {
  methods: VisionSettings['transfer_methods']
  onUpload: (imageFile: ImageFile) => void
  disabled?: boolean
  limit?: number
}
const UploaderButton: FC<UploaderButtonProps> = ({
  methods,
  onUpload,
  disabled,
  limit,
}) => {
  const hasUploadFromLocal = methods.find(method => method === TransferMethod.local_file)

  if (!hasUploadFromLocal)
    return null

  return (
    <Uploader onUpload={onUpload} disabled={disabled} limit={limit}>
      {
        hovering => (
          <div className={`
            relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-[32px]
            ${hovering && 'bg-gray-100'}
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}>
            <ImagePlus className='h-4 w-4 text-gray-500' />
          </div>
        )
      }
    </Uploader>
  )
}

type ChatImageUploaderProps = {
  settings: VisionSettings
  onUpload: (imageFile: ImageFile) => void
  disabled?: boolean
}
const ChatImageUploader: FC<ChatImageUploaderProps> = ({
  settings,
  onUpload,
  disabled,
}) => {
  const onlyUploadLocal = settings.transfer_methods.length === 1 && settings.transfer_methods[0] === TransferMethod.local_file

  if (onlyUploadLocal) {
    return (
      <UploadOnlyFromLocal
        onUpload={onUpload}
        disabled={disabled}
        limit={+settings.image_file_size_limit!}
      />
    )
  }

  return (
    <UploaderButton
      methods={settings.transfer_methods}
      onUpload={onUpload}
      disabled={disabled}
      limit={+settings.image_file_size_limit!}
    />
  )
}

export default ChatImageUploader
