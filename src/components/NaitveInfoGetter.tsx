"use client";

import { useNativeBridge } from "@/hooks/useNativeBridge";

export function NaitveInfoGetter() {
  const { useAppRequestHeader, useGPTConfig, useUserInfo } = useNativeBridge();
  const appRequestHeader = useAppRequestHeader();
  const useInfo = useUserInfo();
  const GPTConfig = useGPTConfig();
  return (
    <div style={styles.text}>
      <p>appRequestHeader: {JSON.stringify(appRequestHeader)}</p>
      <p>useInfo: {JSON.stringify(useInfo)}</p>
      <p>GPTConfig: {JSON.stringify(GPTConfig)}</p>
    </div>
  );
}

const styles = {
  text: {
    fontSize: '12px',
  }
}
