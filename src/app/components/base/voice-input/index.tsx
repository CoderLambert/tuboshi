import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiCloseLine,
  RiLoader2Line,
} from '@remixicon/react'
import Recorder from 'js-audio-recorder'
import { useRafInterval } from 'ahooks'
import { convertToMp3 } from './utils'
import s from './index.module.css'
import cn from '@/utils/classnames'
import { StopCircle } from '@/app/components/base/icons/src/vender/solid/mediaAndDevices'
import { audioToText } from '@/services'

type VoiceInputTypes = {
  onConverted: (text: string) => void
  onCancel: () => void
}

const VoiceInput = ({
  onCancel,
  onConverted,
}: VoiceInputTypes) => {
  const { t } = useTranslation()

  const recorder = useRef<Recorder | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const drawRecordId = useRef<number | null>(null)
  const [originDuration, setOriginDuration] = useState(0)
  const [startRecord, setStartRecord] = useState(false)
  const [startConvert, setStartConvert] = useState(false)
  const clearInterval = useRafInterval(() => {
    setOriginDuration(originDuration + 1)
  }, 1000)

  const initRecorder = useCallback(() => {
    if (recorder.current) {
      recorder.current.destroy()
    }
    recorder.current = new Recorder({
      sampleBits: 16,
      sampleRate: 16000,
      numChannels: 1,
      compiling: false,
    })
  }, [])

  const drawRecord = useCallback(() => {
    drawRecordId.current = requestAnimationFrame(drawRecord)
    const canvas = canvasRef.current!
    const ctx = ctxRef.current!
    if (recorder.current === null) { return }
    const dataUnit8Array = recorder.current.getRecordAnalyseData()
    const dataArray = [].slice.call(dataUnit8Array)
    const lineLength = Number.parseInt(`${canvas.width / 3}`)
    const gap = Number.parseInt(`${1024 / lineLength}`)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    let x = 0
    for (let i = 0; i < lineLength; i++) {
      let v = dataArray.slice(i * gap, i * gap + gap).reduce((prev: number, next: number) => {
        return prev + next
      }, 0) / gap

      if (v < 128) { v = 128 }
      if (v > 178) { v = 178 }
      const y = (v - 128) / 50 * canvas.height

      ctx.moveTo(x, 16)
      if (ctx.roundRect) { ctx.roundRect(x, 16 - y, 2, y, [1, 1, 0, 0]) }
      else { ctx.rect(x, 16 - y, 2, y) }
      ctx.fill()
      x += 3
    }
    ctx.closePath()
  }, [])
  const handleStopRecorder = useCallback(async () => {
    clearInterval()
    setStartRecord(false)
    setStartConvert(true)
    recorder.current!.stop()
    drawRecordId.current && cancelAnimationFrame(drawRecordId.current)
    drawRecordId.current = null
    const canvas = canvasRef.current!
    const ctx = ctxRef.current!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const mp3Blob = convertToMp3(recorder.current)
    const mp3File = new File([mp3Blob], 'temp.mp3', { type: 'audio/mp3' })
    const formData = new FormData()
    formData.append('file', mp3File)

    try {
      const audioResponse = await audioToText(formData)
      onConverted(audioResponse.text)
      onCancel()
    }
    catch {
      onConverted('')
      onCancel()
    }
    finally {
      // 录音完成后销毁资源
      if (recorder.current) {
        recorder.current.destroy()
        recorder.current = null
      }
    }
  }, [clearInterval, onCancel, onConverted])

  const handleCancelRecorder = useCallback(async () => {
    clearInterval()
    setStartRecord(false)
    setStartConvert(false)
    recorder.current!.stop()
    drawRecordId.current && cancelAnimationFrame(drawRecordId.current)
    drawRecordId.current = null
    const canvas = canvasRef.current!
    const ctx = ctxRef.current!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 录音完成后销毁资源
    if (recorder.current) {
      recorder.current.destroy()
      recorder.current = null
    }
    onCancel()
  }, [clearInterval, onCancel, onConverted])

  const handleStartRecord = async () => {
    try {
      // 确保有一个新的 recorder 实例
      if (!recorder.current) {
        initRecorder()
      }

      await recorder.current!.start()
      setStartRecord(true)
      setStartConvert(false)

      if (canvasRef.current && ctxRef.current) { drawRecord() }
    }
    catch {
      // 出错时销毁 recorder 实例
      if (recorder.current) {
        recorder.current.destroy()
        recorder.current = null
      }
      onCancel()
    }
  }

  const initCanvas = () => {
    const dpr = window.devicePixelRatio || 1
    const canvas = document.getElementById('voice-input-record') as HTMLCanvasElement

    if (canvas) {
      const { width: cssWidth, height: cssHeight } = canvas.getBoundingClientRect()

      canvas.width = dpr * cssWidth
      canvas.height = dpr * cssHeight
      canvasRef.current = canvas

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
        ctx.fillStyle = 'rgba(209, 224, 255, 1)'
        ctxRef.current = ctx
      }
    }
  }
  if (originDuration >= 60 && startRecord) { handleStopRecorder() }

  useEffect(() => {
    initCanvas()
    handleStartRecord()
    const recorderRef = recorder?.current
    return () => {
      // 组件卸载时彻底清理资源
      if (recorder.current) {
        recorder.current.stop()
        recorder.current.destroy()
        recorder.current = null
      }
      if (drawRecordId.current) {
        cancelAnimationFrame(drawRecordId.current)
        drawRecordId.current = null
      }
    }
  }, [])

  const minutes = Number.parseInt(`${Number.parseInt(`${originDuration}`) / 60}`)
  const seconds = Number.parseInt(`${originDuration}`) % 60
  // 计算进度百分比 (0-100)
  const progress = Math.min(100, (originDuration / 60) * 100)

  // 判断是否接近时间限制 (最后10秒)
  // const isNearLimit = originDuration >= 50

  return (
    <div className={cn(s.wrapper, 'absolute inset-0 rounded-xl')}>
      <div className='bg-primary-25 absolute inset-[3px] flex items-center overflow-hidden rounded-[21px] py-[28px] pl-[29px] pr-[13px]'>
        <canvas id='voice-input-record' className='absolute bottom-0 left-0 h-4 w-full' />
        {
          startConvert && <RiLoader2Line className='text-primary-700 mr-2 h-4 w-4 animate-spin' />
        }
        <div className='grow'>
          {
            startRecord && (
              <div className='text-sm text-white'>
                {t('app.voiceInput.speaking')}
              </div>
            )
          }
          {
            startConvert && (
              <div className={cn(s.convert, 'text-sm')}>
                {t('app.voiceInput.converting')}
              </div>
            )
          }
        </div>
        {/* 时间显示区域 */}
        <div className="flex items-center justify-center mr-2">
          {/* 进度环和按钮组合 */}
          <div className="relative">
            <svg className="h-8 w-8">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className='text-gray-300'
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                className='text-primary-600 transition-all duration-1000'
                transform="rotate(-90 16 16)"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
              />
            </svg>
            {/* 嵌套在进度环中心的按钮 */}
            {startRecord && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={handleStopRecorder}
              >
                <StopCircle className="text-primary-600 h-4 w-4" />
              </div>
            )}
            {startConvert && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={handleCancelRecorder}
              >
                <RiCloseLine className="h-4 w-4 text-white-700" />
              </div>
            )}
          </div>

           {/* 时间文本 */}
          <div className={`text-xs font-medium text-gray-700 w-[40px] ml-2 mr-4`}>
            {`0${minutes.toFixed(0)}:${seconds >= 10 ? seconds : `0${seconds}`}`}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceInput
