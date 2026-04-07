'use client'
import { useState } from 'react'
import ImagePreview from '@/app/components/base/image-uploader/image-preview'
import { useTranslation } from 'react-i18next'

// 注意：HTML 解析器会将属性名全部转为小写，所以 data-waybillNo → dataWaybillno
const OrderDetail = ({ node, globalExpanded = true }: any) => {
  const p = node.properties || {}
  const { t } = useTranslation()

  const waybillNo: string = p.dataWaybillno || ''
  const orderType: string = p.dataOrdertype || 'receive' // 'send' | 'receive'
  const waybillStatusName: string = p.dataWaybillstatusname || ''
  const timeLabel: string = p.dataTimelabel || ''
  const timeValue: string = p.dataTimevalue || ''
  const imgListRaw: string = p.dataImglist || ''
  const showDetail: boolean = p.dataShowdetail === 'true'

  // 根据 orderType 选择展示发件人还是收件人
  const isSend = orderType === 'send'
  const name: string = isSend ? (p.dataSendername || '') : (p.dataReceivername || '')
  const address: string = isSend ? (p.dataSenderdetailedaddress || '') : (p.dataReceiverdetailedaddress || '')
  const phone: string = isSend ? (p.dataSendermobilephone || '') : (p.dataReceivermobilephone || '')
  const nameLabel = isSend ? '发件人' : '收件人'
  const addressLabel = isSend ? '发件地址' : '收件地址'
  const phoneLabel = isSend ? '发件人电话' : '收件人电话'

  const [showAll, setShowAll] = useState(showDetail)
  const [previewUrl, setPreviewUrl] = useState('')

  // 合并全局状态和局部状态：全局收起时优先全局，全局展开时尊重局部
  const shouldShowDetail = globalExpanded && showAll

  let imageList: string[] = []
  try {
    imageList = imgListRaw
      ? imgListRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
  }
  catch {
    imageList = []
  }

  const handleCall = () => {
    if (phone)
      window.location.href = `tel:${phone}`
  }

  return (
    <div className="my-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">
      {/* 顶部：运单号 + 时间 + 展开按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{waybillNo || '—'}</span>
            {timeValue && <span className="text-xs text-gray-400">{timeValue}</span>}
          </div>

          {/* 姓名和图片在收起态也显示 */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">👤</span>
              <span className="text-gray-700">{name || '—'}</span>
            </div>

            <button
              className="ml-3 flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-600"
              onClick={() => setShowAll(v => !v)}
            >
              {showAll ? '收起' : '展开'}
              <svg
                className={`h-3 w-3 transition-transform ${shouldShowDetail ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* 图片列表在收起态也显示 */}
          {imageList.length > 0 && (
            <div className="mt-3 flex gap-2">
              {imageList.slice(0, 4).map((src, index) => (
                <div
                  key={index}
                  className="h-16 w-16 cursor-pointer overflow-hidden rounded-lg border border-gray-100"
                  onClick={() => setPreviewUrl(src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`img-${index}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {imageList.length > 4 && (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-xs text-gray-400">
                  +{imageList.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 展开态详情 */}
      {shouldShowDetail && (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          {/* 运单状态 */}
          {waybillStatusName && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-gray-400">{t('运单状态')}</span>
              <span>{waybillStatusName}</span>
            </div>
          )}

          {/* 时间 */}
          {timeLabel && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-gray-400">{t(timeLabel)}</span>
              <span>{timeValue || '—'}</span>
            </div>
          )}

          {/* 姓名 */}
          <div className="flex gap-2">
            <span className="w-24 shrink-0 text-gray-400">{t(nameLabel)}</span>
            <span>{name || '—'}</span>
          </div>

          {/* 地址 */}
          <div className="flex gap-2">
            <span className="w-24 shrink-0 text-gray-400">{t(addressLabel)}</span>
            <span className="break-all">{address || '—'}</span>
          </div>

          {/* 电话 + 拨打按钮 */}
          <div className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-gray-400">{t(phoneLabel)}</span>
            <span>{phone || '—'}</span>
            {phone && (
              <button
                className="ml-1 rounded-full bg-green-500 px-2.5 py-0.5 text-xs text-white hover:bg-green-600 active:bg-green-700"
                onClick={handleCall}
              >
                {t('拨打')}
              </button>
            )}
          </div>

          {/* 完整图片列表 */}
          {imageList.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2 pt-1">
              {imageList.map((src, index) => (
                <div
                  key={index}
                  className="aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-100"
                  onClick={() => setPreviewUrl(src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`img-${index}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 大图预览 */}
      {previewUrl && (
        <ImagePreview
          url={previewUrl}
          title={waybillNo}
          onCancel={() => setPreviewUrl('')}
        />
      )}
    </div>
  )
}

OrderDetail.displayName = 'OrderDetail'

export default OrderDetail
