'use client'
import type { FC } from 'react'
import React, { useState } from 'react'
import type { IChatItem } from '../type'
import s from '../style.module.css'

import { Markdown } from '@/app/components/markdown'
import ImageGallery from '@/app/components/base/image-gallery'
import CopyIcon from '@/app/components/base/copy-icon'

type IQuestionProps = Pick<IChatItem, 'id' | 'content' | 'useCurrentUserAvatar'> & {
  imgSrcs?: string[]
}

const IconWrapper: FC<{ children: React.ReactNode | string }> = ({ children }) => {
  return <div className={'flex h-6 w-6 items-center justify-center rounded-lg hover:bg-gray-100'}>
    {children}
  </div>
}

const Question: FC<IQuestionProps> = ({ id, content, useCurrentUserAvatar: _useCurrentUserAvatar, imgSrcs }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className='flex min-w-0 max-w-full items-start justify-end' key={id}>
      <div className="min-w-0 max-w-full">
        <div 
          className={`${s.question} relative min-w-0 max-w-full text-sm text-gray-900`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={'mr-2 min-w-0 max-w-full overflow-hidden rounded-b-[32px] rounded-tl-[32px] bg-[#D1E9FF]/50 px-4 py-3'}
          >
            {imgSrcs && imgSrcs.length > 0 && (
              <ImageGallery srcs={imgSrcs} />
            )}
            <Markdown content={content} />
          </div>
          {content && isHovered && (
            <div className='absolute bottom-[-28px] right-[8px] flex flex-row justify-end gap-1'>
              <div className={'relative box-border flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-white p-0.5 text-gray-500 hover:text-gray-800'}
                   style={{ boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)' }}>
                <IconWrapper>
                  <CopyIcon content={content} />
                </IconWrapper>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Question)




