import { useEffect } from "react"
import useAppStore from "./useAppStore"

export function useNativeBridge() {
  const callNativeMethod = (methodName, params, callbackName) =>
    new Promise((resolve, reject) => {
      if (!methodName || typeof methodName !== 'string') {
        reject(new Error('Invalid method name'))
      }
      if (typeof params !== 'object') {
        reject(new Error('Invalid parameters'))
      }
      try {
        if (window.flutter_inappwebview) {
          if (typeof callbackName === 'string') {
            window[callbackName] = (data) => {
              resolve(data)
            }
          }
          window.flutter_inappwebview
            .callHandler(methodName, params)
            .then(function (response) {
              resolve(response)
            })
        } else {
          if (window.webkit && window.webkit.messageHandlers) {
            if (typeof callbackName === 'string') {
              window[callbackName] = (data) => {
                resolve(data)
              }
            }
            // 调用原生iOS方法
            window.webkit.messageHandlers[methodName].postMessage(params)
          } else if (window.Android) {
            if (typeof callbackName === 'string') {
              window[callbackName] = (data) => {
                resolve(data)
              }
            }
            // 调用原生安卓方法
            if (methodName === 'jsToNative') {
              const res = Android[methodName](JSON.stringify(params))
              resolve(res)
            } else {
              const res = Android[methodName]()
              resolve(res)
            }
          } else {
            reject(`Native method not found: ${methodName}`)
          }
        }
      } catch (err) {
        console.error(`useNativeBridge:methodName:${methodName}`, err)
        reject(err)
      }
    })

    const useAppRequestHeader = () => {
      const setAppRequestHeader = useAppStore((state) => state.setAppRequestHeader)
      const appRequestHeader = useAppStore((state) => state.appRequestHeader)
      useEffect(() => {
        const getInfo = async () => {
          const res = await callNativeMethod('getAppRequestHeader', {})
          setAppRequestHeader(res)
        }
        getInfo()
      }, [])
      return appRequestHeader;
    }

    const useUserInfo = () => {
      const setUserInfo = useAppStore((state) => state.setUserInfo)
      const userInfo = useAppStore((state) => state.userInfo)
      useEffect(() => {
        const getInfo = async () => {
          const res = await callNativeMethod('getUserInfo', {})
          setUserInfo(res)
        }
        getInfo()
      }, [])
      return userInfo;
    }

    const useGPTConfig = () => {
      const setGPTConfig = useAppStore((state) => state.setGPTConfig)
      const GPTConfig = useAppStore((state) => state.GPTConfig)
      useEffect(() => {
        const getInfo = async () => {
          const res = await callNativeMethod('getGPTConfig', {})
          setGPTConfig(res)
        }
        getInfo()
      }, [])
      return GPTConfig
    }

  return {
    callNativeMethod,
    useAppRequestHeader,
    useUserInfo,
    useGPTConfig
  }
}
