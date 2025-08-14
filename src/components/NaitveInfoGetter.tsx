"use client";

import { useNativeBridge } from "@/hooks/useNativeBridge";

export function NaitveInfoGetter() {
  const { useAppRequestHeader, useGPTConfig, useUserInfo, useStatusBarHeight } = useNativeBridge();
  const appRequestHeader = useAppRequestHeader();
  const useInfo = useUserInfo();
  const GPTConfig = useGPTConfig();
  const statusBarHeight = useStatusBarHeight();
  return (
    <div style={styles.text}>
      <p>appRequestHeader: {JSON.stringify(appRequestHeader)}</p>
      <p>useInfo: {JSON.stringify(useInfo)}</p>
      <p>GPTConfig: {JSON.stringify(GPTConfig)}</p>
      <p>statusBarHeight: {JSON.stringify(statusBarHeight)}</p>
    </div>
  );
}

const styles = {
  text: {
    fontSize: '12px',
  }
}
