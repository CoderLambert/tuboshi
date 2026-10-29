import type { BridgeLogEntry, DemoLang } from './types'
import { DEMO_FAQ, DEMO_GPT, DEMO_USER } from './content'

const listeners = new Set<() => void>()

export const bridgeLog: BridgeLogEntry[] = []

export function onBridgeLog(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  listeners.forEach(listener => listener())
}

export function getDemoLang(): DemoLang {
  if (typeof location === 'undefined')
    return 'EN'
  const query = new URLSearchParams(location.search).get('lang')?.toUpperCase()
  const fromQuery = query === 'ZH' ? 'CN' : query
  if (fromQuery === 'CN' || fromQuery === 'EN' || fromQuery === 'PT')
    return fromQuery
  const stored = localStorage.getItem('demo-lang')
  if (stored === 'CN' || stored === 'EN' || stored === 'PT')
    return stored
  return 'EN'
}

export function setDemoLang(lang: DemoLang) {
  localStorage.setItem('demo-lang', lang)
  const url = new URL(location.href)
  url.searchParams.delete('lang')
  location.replace(url.toString())
}

function handleCall(method: string, params: unknown) {
  const lang = getDemoLang()
  switch (method) {
    case 'getAppRequestHeader':
      return {
        version: '3.6.0-demo',
        lang,
        platform: 'android',
        deviceModel: 'Demo Phone',
      }
    case 'getUserInfo':
      return {
        token: DEMO_USER.token,
        userCode: DEMO_USER.userCode,
        userName: DEMO_USER.userName,
        siteName: DEMO_USER.siteName,
      }
    case 'getGPTConfig':
      return DEMO_GPT
    case 'getInputsForm':
      return {
        token: DEMO_USER.token,
        app_version: '3.6.0-demo',
        langType: lang,
        app_platform: 'android',
      }
    case 'getUserID':
      return { 'user-id': DEMO_USER.userCode }
    case 'getStatusBarHeight': {
      const width = document.documentElement.clientWidth || 390
      // ~44px in the phone frame, expressed in the app's --tpx design units.
      return { top: String(Math.round(16500 / width)), bottom: '0' }
    }
    case 'qaData':
      return { data: DEMO_FAQ[lang] }
    case 'finish':
      window.dispatchEvent(new CustomEvent('demo:toast', {
        detail: 'finish() → 宿主 App 将关闭 WebView（演示）',
      }))
      return { ok: true }
    case 'jsToNative':
      return { ok: true, echo: params }
    default:
      return null
  }
}

export function installDemoBridge() {
  if (typeof window === 'undefined')
    return
  const existing = (window as Window & { flutter_inappwebview?: { callHandler?: unknown } }).flutter_inappwebview
  if (existing?.callHandler)
    return

  ;(window as Window & { flutter_inappwebview?: unknown }).flutter_inappwebview = {
    callHandler(method: string, params: unknown) {
      const result = handleCall(method, params)
      bridgeLog.push({ t: Date.now(), method, params, result })
      if (bridgeLog.length > 50)
        bridgeLog.shift()
      notify()
      return new Promise(resolve => setTimeout(() => resolve(result), 40 + 60 * Math.random()))
    },
  }
}
