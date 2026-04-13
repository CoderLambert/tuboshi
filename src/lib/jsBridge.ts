/* global Android, window */
import { parseJsonStringResponse } from '@/lib/utils'

export type JsBridgeMethodName
    = | 'getAppRequestHeader'
    | 'getUserInfo'
    | 'getGPTConfig'
    | 'getInputsForm'
    | 'getUserID'
    | 'finish' // closeWebview 对应的方法名
    | 'getStatusBarHeight'
    | 'qaData'
    | 'jsToNative'
    | 'openGoogleMap'
    | 'openCall'

export type JsBridgeCallbackMethodName
    = | 'getAppRequestHeaderCallback'
    | 'getUserInfoCallback'
    | 'getGPTConfigCallback'
    | 'getInputsFormCallback'
    | 'getUserIDCallback'
    | 'finishCallback' // closeWebview 对应的方法名
    | 'getStatusBarHeightCallback'
    | 'qaDataCallback'
    | 'jsToNativeCallback'
    | 'openGoogleMapCallback'
    | 'openCallCallback'

// 原生方法调用核心函数
export function callNativeMethod(methodName: JsBridgeMethodName, params = {}, callbackName: JsBridgeCallbackMethodName) {
  return new Promise((resolve, reject) => {
    if (!methodName || typeof methodName !== 'string') {
      reject(new Error('Invalid method name'))
      return
    }

    if (typeof params !== 'object') {
      reject(new Error('Invalid parameters'))
      return
    }

    try {
      if (window.flutter_inappwebview) {
        if (typeof callbackName === 'string') {
          window[callbackName] = (data: any) => {
            resolve(data)
          }
        }
        window.flutter_inappwebview
          .callHandler(methodName, params)
          .then((response) => {
            resolve(response)
          })
      }
      else if (window.webkit && window.webkit.messageHandlers) {
        if (typeof callbackName === 'string') {
          window[callbackName] = (data: any) => {
            resolve(parseJsonStringResponse(data))
          }
        }
        // 调用原生iOS方法
        window.webkit.messageHandlers[methodName].postMessage(params)
      }
      else if (window.Android) {
        if (typeof callbackName === 'string') {
          window[callbackName] = (data: any) => {
            resolve(parseJsonStringResponse(data))
          }
        }
        // 调用原生安卓方法
        if (methodName === 'jsToNative') {
          const res = window.Android[methodName](JSON.stringify(params))
          resolve(res)
        }
        else {
          const res = window.Android[methodName]()
          resolve(res)
        }
      }
      else {
        reject(new Error(`Native method not found: ${methodName}`))
      }
    }
    catch (err) {
      console.error(`callNativeMethod:methodName:${methodName}`, err)
      reject(err)
    }
  })
}

// 各种业务方法的纯函数实现
export function getAppRequestHeader() {
  return callNativeMethod('getAppRequestHeader', {}, 'getAppRequestHeaderCallback')
}

export function getUserInfo() {
  return callNativeMethod('getUserInfo', {}, 'getUserIDCallback')
}

export function getGPTConfig() {
  return callNativeMethod('getGPTConfig', {}, 'getGPTConfigCallback') as Promise<{
    app_key: string
    app_id: string
    api_url: string
  }>
}

export function getInputsForm() {
  return callNativeMethod('getInputsForm', {}, 'getInputsFormCallback')
}

export function getUserID() {
  return callNativeMethod('getUserID', {}, 'getUserIDCallback')
}

export function closeWebview() {
  return callNativeMethod('finish', {}, 'finishCallback')
}

export function getStatusBarHeight() {
  return callNativeMethod('getStatusBarHeight', {}, 'getStatusBarHeightCallback')
}

export function getQaData() {
  return callNativeMethod('qaData', {}, 'qaDataCallback')
}

export function openGoogleMap(params: { addressList: string }) {
  return callNativeMethod('openGoogleMap', params, 'openGoogleMapCallback')
}

export function openCall(params: { waybillNo: string }) {
  return callNativeMethod('openCall', params, 'openCallCallback')
}
