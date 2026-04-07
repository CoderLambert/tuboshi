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
    <div className="my-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">
      {/* 收起态：运单号 + 展开按钮 */}
      <div className="flex items-center justify-between">
        <span className="font-medium">{waybillNo || '—'}</span>
        <button
          className="ml-3 shrink-0 text-xs text-blue-500 hover:text-blue-600"
          onClick={() => setShowAll(v => !v)}
        >
          {showAll ? '收起' : '展开'}
        </button>
      </div>

      {/* 展开态详情 */}
      {shouldShowDetail && (
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          {/* 运单号 */}
          <div className="flex gap-2">
            <span className="w-28 shrink-0 text-gray-400">运单号</span>
            <span className="break-all font-medium">{waybillNo || '—'}</span>
          </div>

          {/* 运单状态 */}
          {waybillStatusName && (
            <div className="flex gap-2">
              <span className="w-28 shrink-0 text-gray-400">{t('运单状态')}</span>
              <span>{waybillStatusName}</span>
            </div>
          )}

          {/* 时间 */}
          {timeLabel && (
            <div className="flex gap-2">
              <span className="w-28 shrink-0 text-gray-400">{t(timeLabel)}</span>
              <span>{timeValue || '—'}</span>
            </div>
          )}

          {/* 姓名 */}
          <div className="flex gap-2">
            <span className="w-28 shrink-0 text-gray-400">{t(nameLabel)}</span>
            <span>{name || '—'}</span>
          </div>

          {/* 地址 */}
          <div className="flex gap-2">
            <span className="w-28 shrink-0 text-gray-400">{t(addressLabel)}</span>
            <span className="break-all">{address || '—'}</span>
          </div>

          {/* 电话 + 拨打按钮 */}
          <div className="flex items-center gap-2">
            <span className="w-28 shrink-0 text-gray-400">{t(phoneLabel)}</span>
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

          {/* 图片列表：一行 4 张 */}
          {imageList.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-1.5 pt-1">
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
          onCancel={() => setPreviewUrl('')}
        />
      )}
    </div>
  )
}

OrderDetail.displayName = 'OrderDetail'

export default OrderDetail
