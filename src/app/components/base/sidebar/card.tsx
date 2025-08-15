import React from 'react'
import { useTranslation } from 'react-i18next'
import s from './card.module.css'

type PropType = {
  children: React.ReactNode
  text?: string
}
function Card({ children, text }: PropType) {
  const { t } = useTranslation()
  return (
    <div className={`${s.card} hover:border-primary-300 box-border flex w-full cursor-pointer flex-col items-start rounded-lg border border-solid border-gray-200  px-4 py-3`}>
      <div className='mb-2 text-xs font-medium text-gray-400'>{text ?? t('app.chat.powerBy')}</div>
      {children}
    </div>
  )
}

export default Card
