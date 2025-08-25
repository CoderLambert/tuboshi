'use client'

import { useNativeBridge } from '@/hooks/useNativeBridge'

export function NaitveInfoGetter() {
  const { useAppRequestHeader, useGPTConfig, useUserInfo, useStatusBarHeight, useQaData } = useNativeBridge()
  const appRequestHeader = useAppRequestHeader()
  const useInfo = useUserInfo()
  const GPTConfig = useGPTConfig()
  const statusBarHeight = useStatusBarHeight()
  const qaData = useQaData()
  return (
    <div className='prose flex w-full flex-col gap-4 overflow-auto' style={styles.text}>
      <p>appRequestHeader: {JSON.stringify(appRequestHeader)}</p>
      <p>useInfo: {JSON.stringify(useInfo)}</p>
      <p>GPTConfig: {JSON.stringify(GPTConfig)}</p>
      <p>statusBarHeight: {JSON.stringify(statusBarHeight)}</p>
      <p>qaData: {JSON.stringify(qaData)}</p>
    </div>
  )
}

const styles = {
  text: {
    fontSize: '12px',
  },
}
