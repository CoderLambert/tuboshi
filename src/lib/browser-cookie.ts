import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'

export const SECRET_KEY = 'wyr^a4D>YZjTg3kU'
const NEED_ENCRYPT_COOKIES = ['api_key', 'api_url', 'app_id', 'gpt_config']

console.log(`SECRET_KEY   ==>  ${SECRET_KEY}`)

export const hashTo16Bytes = (input: string): string => {
  // 使用HMAC-SHA256生成哈希
  const hash = CryptoJS.HmacSHA256(input, SECRET_KEY)

  // 取前16字节（128位）
  const wordArray = CryptoJS.lib.WordArray.create(hash.words.slice(0, 4))

  // 转换为Latin1编码字符串（确保每个字符1字节）
  return wordArray.toString(CryptoJS.enc.Latin1)
}

// 加密函数
export const encrypt = (text: string, userId: string): string => {
  const key = hashTo16Bytes(`${userId}`)
  console.log(`encrypt key  ==>  ${key}`)
  // 确保数据是 UTF-8 编码
  const srcs = CryptoJS.enc.Utf8.parse(text)

  const encrypted = CryptoJS.AES.encrypt(srcs, key)
  return encrypted.toString()
}

// 解密函数
export const decrypt = (ciphertext: string, userId: string): string => {
  console.log(`decrypt userId  ==>  ${userId}`)
  const key = hashTo16Bytes(`${userId}`)
  console.log(`decrypt key  ==>  ${key}`)

  // 使用密钥和 IV 进行解密
  // 直接使用Base64字符串进行解密
  const decrypt = CryptoJS.AES.decrypt(ciphertext, key)
  console.log(`decrypt content ==>  ${decrypt.toString()}`)
  // 将解密后的字节串转换为 UTF-8 编码的字符串
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
  console.log(`decryptedStr ==>  ${decryptedStr}`)
  return decryptedStr
}

// 自动判断是否需要加密/解密
export const shouldEncrypt = (name: string): boolean => {
  return NEED_ENCRYPT_COOKIES.includes(name)
}

export const enhancedCookies = {
  set: (name: string, value: string, userId?: string, options?: Cookies.CookieAttributes) => {
    console.log(`set  ==>  ${name}  ${value}`)

    const finalValue = shouldEncrypt(name) ? encrypt(value, userId!) : value
    Cookies.set(name, finalValue, options)
  },

  get: (name: string, userId: string): string | undefined => {
    const value = Cookies.get(name)
    if (!value) { return undefined }
    return shouldEncrypt(name) ? decrypt(value, userId) : value
  },

  remove: (name: string, options?: Cookies.CookieAttributes) => {
    Cookies.remove(name, options)
  },

  removeAll: () => {
    const cookieNames = Object.keys(Cookies.get())

    cookieNames.forEach((name) => {
      enhancedCookies.remove(name)
    })
  },
}
