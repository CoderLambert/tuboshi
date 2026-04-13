'use client'
import { useState } from 'react'
import ImagePreview from '@/app/components/base/image-uploader/image-preview'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import StaffIcon from '@/assets/icons/staff.svg'
import PhoneIcon from '@/assets/icons/phone.svg'
import AddressIcon from '@/assets/icons/address.svg'
import MapIcon from '@/assets/icons/map.svg'
import ArrowUpIcon from '@/assets/icons/arrow-up.svg'
import ArrowDownIcon from '@/assets/icons/arrow-down.svg'
import CallIcon from '@/assets/icons/call.svg'

// 注意：HTML 解析器会将属性名全部转为小写，所以 data-waybillNo → dataWaybillno
const OrderDetail = ({ node, globalExpanded = true }: any) => {
  const p = node.properties || {}
  const { t } = useTranslation()
  const statusMap: Record<string, string> = {
    '1': 'text-[#26B269]', // 已签收
    '2': 'text-[#26B269]', // 退件签收
    '3': 'text-[#3783FF]', // 派送中
  }

  const waybillNo: string = p.dataWaybillno || ''
  const orderType: string = p.dataOrdertype || 'receive' // 'send' | 'receive'
  const waybillStatusName: string = p.dataWaybillstatusname || ''
  const waybillStatusCode: string = p.dataWaybillstatus || ''
  const statusColor: string = statusMap[waybillStatusCode]
  // const timeLabel: string = p.dataTimelabel || ''
  const timeValue: string = p.dataTimevalue || ''
  const imgListRaw: string = p.dataImglist || ''
  const showDetail: boolean = p.dataShowdetail === 'true'

  // 根据 orderType 选择展示发件人还是收件人
  const isSend = orderType === 'send'
  const name: string = isSend ? (p.dataSendername || '') : (p.dataReceivername || '')
  const address: string = isSend ? (p.dataSenderdetailedaddress || '') : (p.dataReceiverdetailedaddress || '')
  const phone: string = isSend ? (p.dataSendermobilephone || '') : (p.dataReceivermobilephone || '')
  // const nameLabel = isSend ? '发件人' : '收件人'
  // const addressLabel = isSend ? '发件地址' : '收件地址'
  // const phoneLabel = isSend ? '发件人电话' : '收件人电话'

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
    <div className="my-[12px] rounded-[24px] border border-gray-100 bg-white px-[24px] py-[12px] text-sm text-gray-800 shadow-sm min-w-[540px]">
      {/* 顶部：运单号 + 时间 + 展开按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[32px] leading-[48px] font-semibold">{waybillNo || '—'}</span>
            {timeValue && <span className="text-[20px] text-gray-400 leading-[48px]">{timeValue.substring(0, 16)}</span>}
          </div>

          {/* 姓名和图片在收起态也显示 */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-start gap-2">
              <Image
                className='w-[32px] h-[32px]'
                src={StaffIcon}
                alt="Staff"
              />
              <span className="text-gray-700">{name || '—'}</span>
            </div>

          </div>

          {/* 展开态详情 */}
          {shouldShowDetail && (
            <div className="space-y-3 mt-3">

              {/* 电话（带电话图标） */}
              <div className="flex items-start gap-2">
                <Image
                  src={PhoneIcon}
                  alt="Phone"
                  className='w-[32px] h-[32px]'
                />
                <span>{phone || '—'}</span>
              </div>

              {/* 地址（带地址图标） */}
              <div className="flex items-start gap-2">
                <Image
                  src={AddressIcon}
                  alt="Location"
                  className='w-[32px] h-[32px]'
                />
                <span className="break-all flex-1">{address || '—'}</span>
              </div>

            </div>
          )}
          <div className='mt-3 flex items-center justify-between'>
            {/* 图片列表在收起态也显示 */}
            {imageList.length > 0 && (
              <div className="flex gap-2">
                {imageList.slice(0, 4).map((src, index) => (
                  <div
                    key={index}
                    className="h-[52px] w-[52px] cursor-pointer overflow-hidden rounded-[8px]"
                    onClick={() => setPreviewUrl(src)}
                  >
                    <img
                      src={src}
                      alt={`img-${index}`}
                      className="h-full w-full object-cover"
                      style={{ border: 'none' }}
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
            <button
              className="ml-auto flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-600"
              onClick={() => setShowAll(v => !v)}
            >
              {showAll ? '收起' : '展开'}
              <Image src={showAll ? ArrowUpIcon : ArrowDownIcon} alt="Arrow"
                className='w-[24px] h-[24px]' />
            </button>
          </div>
        </div>
      </div>
      <div className='flex justify-between items-center mt-[24px]'>
        {waybillStatusName && (<div className={statusColor}>{waybillStatusName}</div>)}
        {(address || phone) && (
          <div className='flex justify-end items-center'>
            {address && (
              <button
                className={phone ? 'border-r border-gray-200 pr-[48px]' : ''}
                onClick={() => setPreviewUrl(`https://maps.google.com/?q=${encodeURIComponent(address)}`)}
              >
                <Image src={MapIcon} alt="Map" className='w-[48px] h-[48px]' />
              </button>
            )}
            {phone && (
              <button
                className={address ? 'pl-[48px]' : ''}
                onClick={handleCall}
              >
                <Image src={CallIcon} alt="Call" className='w-[48px] h-[48px]' />
              </button>
            )}
          </div>)}
      </div>

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
