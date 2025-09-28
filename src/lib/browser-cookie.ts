import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'

export const SECRET_KEY = 'wyr^a4D>YZjTg3kU'
const NEED_ENCRYPT_COOKIES = ['api_key', 'api_url', 'app_id']

console.log(`SECRET_KEY   ==>  ${SECRET_KEY}`)

export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString()
}

export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// 自动判断是否需要加密/解密
export const shouldEncrypt = (name: string): boolean => {
  return NEED_ENCRYPT_COOKIES.includes(name)
}

export const enhancedCookies = {
  set: (name: string, value: string, options?: Cookies.CookieAttributes) => {
    const finalValue = shouldEncrypt(name) ? encrypt(value) : value
    Cookies.set(name, finalValue, options)
  },

  get: (name: string): string | undefined => {
    const value = Cookies.get(name)
    if (!value) { return undefined }
    // TODO  应该加个校验  为空字符串时报错
    return shouldEncrypt(name) ? decrypt(value) : value
  },

  remove: (name: string, options?: Cookies.CookieAttributes) => {
    Cookies.remove(name, options)
  },
}
