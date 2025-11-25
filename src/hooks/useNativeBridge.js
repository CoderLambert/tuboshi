import { useEffect } from 'react'
import useAppStore from './useAppStore'
/* global Android, window */
export function useNativeBridge() {
  const callNativeMethod = (methodName, params, callbackName) => {
    return new Promise((resolve, reject) => {
      if (!methodName || typeof methodName !== 'string') { reject(new Error('Invalid method name')) }

      if (typeof params !== 'object') { reject(new Error('Invalid parameters')) }

      try {
        if (window.flutter_inappwebview) {
          if (typeof callbackName === 'string') {
            window[callbackName] = (data) => {
              resolve(data)
            }
          }
          window.flutter_inappwebview
            .callHandler(methodName, params)
            .then((response) => {
              resolve(response)
            })
        }
        else {
          if (window.webkit && window.webkit.messageHandlers) {
            if (typeof callbackName === 'string') {
              window[callbackName] = (data) => {
                resolve(data)
              }
            }
            // 调用原生iOS方法
            window.webkit.messageHandlers[methodName].postMessage(params)
          }
          else if (window.Android) {
            if (typeof callbackName === 'string') {
              window[callbackName] = (data) => {
                resolve(data)
              }
            }
            // 调用原生安卓方法
            if (methodName === 'jsToNative') {
              const res = Android[methodName](JSON.stringify(params))
              resolve(res)
            }
            else {
              const res = Android[methodName]()
              resolve(res)
            }
          }
          else {
            reject(new Error(`Native method not found: ${methodName}`))
          }
        }
      }
      catch (err) {
        console.error(`useNativeBridge:methodName:${methodName}`, err)
        reject(err)
      }
    })
  }

  const useAppRequestHeader = () => {
    const setAppRequestHeader = useAppStore(state => state.setAppRequestHeader)
    const appRequestHeader = useAppStore(state => state.appRequestHeader)
    useEffect(() => {
      const getInfo = async () => {
        const res = await callNativeMethod('getAppRequestHeader', {})
        setAppRequestHeader(res)
      }
      getInfo()
    }, [])
    return appRequestHeader
  }

  const useUserInfo = () => {
    const setUserInfo = useAppStore(state => state.setUserInfo)
    const userInfo = useAppStore(state => state.userInfo)
    useEffect(() => {
      const getInfo = async () => {
        // const res = await callNativeMethod('getUserInfo', {})
        // setUserInfo(res)
        setUserInfo({
          'user-id': '4707011998',
        })
      }
      getInfo()
    }, [])
    return userInfo
  }

  const useGPTConfig = () => {
    const setGPTConfig = useAppStore(state => state.setGPTConfig)
    const GPTConfig = useAppStore(state => state.GPTConfig)
    useEffect(() => {
      const getInfo = async () => {
        // const res = await callNativeMethod('getGPTConfig', {})
        const res = { app_key: 'app-b9TjpM58FhCOuWUPhCGzAydW', app_id: '9f47d0e7-93f5-45c9-9e50-8b411ab421bf', api_url: 'https://ai-agent.jtexpress.ph/v1' }
        setGPTConfig(res)
      }
      getInfo()
    }, [])
    return GPTConfig
  }

  const useInputsFormConfig = () => {
    const setInputsForm = useAppStore(state => state.setInputsForm)
    const inputsFormConfig = useAppStore(state => state.inputsForm)
    useEffect(() => {
      const getInputsFormInfo = async () => {
        // const res = await callNativeMethod('getInputsForm', {})
        // console.log('useEffect inputsFormConfig', res)
        // ts-ignore
        const res = {
          token: 'f6c2e97900f34dfa95b862f966eeb091',
          app_version: '3.1.9.3', // eslint-disable-line sonarjs/no-hardcoded-ip
          langType: 'EN',
          app_platform: '.outfield.',
        }
        setInputsForm(res)
      }
      getInputsFormInfo()
    }, [])
    return inputsFormConfig
  }

  const useUserID = () => {
    const setUserID = useAppStore(state => state.setUserID)
    const userID = useAppStore(state => state.userID)
    const getUserID = async () => {
      // const res = await callNativeMethod('getUserID', {})
      setUserID({
        'user-id': '4707011998',
      })
      // setUserID(res)
    }
    useEffect(() => {
      getUserID()
    }, [])
    return userID
  }

  const closeWebview = () => {
    callNativeMethod('finish', {})
  }

  const useStatusBarHeight = () => {
    const setStatusBarHeight = useAppStore(state => state.setStatusBarHeight)
    const statusBarHeight = useAppStore(state => state.statusBarHeight)
    useEffect(() => {
      const getInfo = async () => {
        // const res = await callNativeMethod('getStatusBarHeight', {})
        // setStatusBarHeight(res)
        setStatusBarHeight({ top: 40 })
      }
      getInfo()
    }, [])
    return statusBarHeight
  }

  const useQaData = () => {
    const setQaData = useAppStore(state => state.setQaData)
    const qaData = useAppStore(state => state.qaData)
    useEffect(() => {
      const getInfo = async () => {
        // const res = await callNativeMethod('qaData', {})
        // setQaData(res)
        setQaData([])
      }
      getInfo()
    }, [])
    return qaData
  }

  return {
    callNativeMethod,
    useAppRequestHeader,
    useUserInfo,
    useGPTConfig,
    closeWebview,
    useStatusBarHeight,
    useQaData,
    useInputsFormConfig,
    useUserID,
  }
}
