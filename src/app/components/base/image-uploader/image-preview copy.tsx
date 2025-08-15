import type { FC } from 'react'
import { createPortal } from 'react-dom'
import XClose from '@/app/components/base/icons/src/vender/line/x-close'

type ImagePreviewProps = {
  url: string
  onCancel: () => void
}
const ImagePreview: FC<ImagePreviewProps> = ({
  url,
  onCancel,
}) => {
  return createPortal(
    <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-8' onClick={e => e.stopPropagation()}>
      <img
        alt='preview image'
        src={url}
        className='max-h-full max-w-full'
      />
      <div
        className='absolute right-6 top-6 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/[0.08] backdrop-blur-[2px]'
        onClick={onCancel}
      >
        <XClose className='h-4 w-4 text-white' />
      </div>
    </div>,
    document.body,
  )
}

export default ImagePreview
