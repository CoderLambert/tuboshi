'use client'
import type { FC } from 'react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import cn from 'clsx'
import type { ToolInfoInThought } from '../type'
import Panel from './panel'
import Loading02 from '@/app/components/base/icons/src/vender/line/loading-02'
import ChevronDown from '@/app/components/base/icons/src/vender/line/arrows/chevron-down'
import CheckCircle from '@/app/components/base/icons/src/vender/solid/general/check-circle'
import DataSetIcon from '@/app/components/base/icons/src/vender/public/data-set'
import type { Emoji } from '@/types/tools'
import AppIcon from '@/app/components/base/app-icon'

type Props = {
  payload: ToolInfoInThought
  allToolIcons?: Record<string, string | Emoji>
}

const getIcon = (toolName: string, allToolIcons: Record<string, string | Emoji>) => {
  if (toolName.startsWith('dataset-'))
    return <DataSetIcon className='shrink-0'></DataSetIcon>
  const icon = allToolIcons[toolName]
  if (!icon)
    return null
  return (
    typeof icon === 'string'
      ? (
        <div
          className='h-3 w-3 shrink-0 rounded-[3px] bg-cover bg-center'
          style={{
            backgroundImage: `url(${icon})`,
          }}
        ></div>
      )
      : (
        <AppIcon
          className='shrink-0 rounded-[3px]'
          size='xs'
          icon={icon?.content}
          background={icon?.background}
        />
      ))
}

const Tool: FC<Props> = ({
  payload,
  allToolIcons = {},
}) => {
  const { t } = useTranslation()
  const { name, input, isFinished, output } = payload
  const toolName = name.startsWith('dataset-') ? t('dataset.knowledge') : name
  const [isShowDetail, setIsShowDetail] = useState(false)
  const icon = getIcon(toolName, allToolIcons) as any
  return (
    <div>
      <div className={cn(!isShowDetail && 'shadow-sm', !isShowDetail && 'inline-block', 'max-w-full overflow-x-auto rounded-md bg-white')}>
        <div
          className={cn('flex h-7 cursor-pointer items-center px-2')}
          onClick={() => setIsShowDetail(!isShowDetail)}
        >
          {!isFinished && (
            <Loading02 className='h-3 w-3 shrink-0 animate-spin text-gray-500' />
          )}
          {isFinished && !isShowDetail && (
            <CheckCircle className='h-3 w-3 shrink-0 text-[#12B76A]' />
          )}
          {isFinished && isShowDetail && (
            icon
          )}
          <span className='mx-1 shrink-0 text-xs font-medium text-gray-500'>
            {t(`tools.thought.${isFinished ? 'used' : 'using'}`)}
          </span>
          <span
            className='truncate text-xs font-medium text-gray-700'
            title={toolName}
          >
            {toolName}
          </span>
          <ChevronDown
            className={cn(isShowDetail && 'rotate-180', 'ml-1 h-3 w-3 shrink-0 cursor-pointer select-none text-gray-500')}
          />
        </div>
        {isShowDetail && (
          <div className='space-y-2 border-t border-black/5 p-2 '>
            <Panel
              isRequest={true}
              toolName={toolName}
              content={input} />
            {output && (
              <Panel
                isRequest={false}
                toolName={toolName}
                content={output as string} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
export default React.memo(Tool)
