import { API_PREFIX } from '@/config'
import Toast from '@/app/components/base/toast'
import type { AnnotationReply, MessageEnd, MessageReplace, ThoughtItem } from '@/app/components/chat/type'
import type { VisionFile } from '@/types/app'
import type { Timeout } from 'ahooks/lib/useRequest/src/types'
import { t } from 'i18next'
import { tryRepairJson } from '@/utils/string'
const TIME_OUT = 200000

const ContentType = {
  json: 'application/json',
  stream: 'text/event-stream',
  form: 'application/x-www-form-urlencoded; charset=UTF-8',
  download: 'application/octet-stream', // for download
}

const baseOptions = {
  method: 'GET',
  mode: 'cors',
  credentials: 'include', // always send cookies、HTTP Basic authentication.
  headers: new Headers({
    'Content-Type': ContentType.json,
  }),
  redirect: 'follow',
}

export type WorkflowStartedResponse = {
  task_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    workflow_id: string
    sequence_number: number
    created_at: number
  }
}

export type WorkflowFinishedResponse = {
  task_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    workflow_id: string
    status: string
    outputs: any
    error: string
    elapsed_time: number
    total_tokens: number
    total_steps: number
    created_at: number
    finished_at: number
  }
}

export type NodeStartedResponse = {
  task_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    node_id: string
    node_type: string
    index: number
    predecessor_node_id?: string
    inputs: any
    created_at: number
    extras?: any
  }
}

export type NodeFinishedResponse = {
  task_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    node_id: string
    node_type: string
    index: number
    predecessor_node_id?: string
    inputs: any
    process_data: any
    outputs: any
    status: string
    error: string
    elapsed_time: number
    execution_metadata: {
      total_tokens: number
      total_price: number
      currency: string
    }
    created_at: number
  }
}

export type IOnDataMoreInfo = {
  conversationId?: string
  taskId?: string
  messageId: string
  errorMessage?: string
  errorCode?: string
}

export type IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => void
export type IOnThought = (though: ThoughtItem) => void
export type IOnFile = (file: VisionFile) => void
export type IOnMessageEnd = (messageEnd: MessageEnd) => void
export type IOnMessageReplace = (messageReplace: MessageReplace) => void
export type IOnAnnotationReply = (messageReplace: AnnotationReply) => void
export type IOnCompleted = (hasError?: boolean) => void
export type IOnError = (msg: string, code?: string) => void
export type IOnWorkflowStarted = (workflowStarted: WorkflowStartedResponse) => void
export type IOnWorkflowFinished = (workflowFinished: WorkflowFinishedResponse) => void
export type IOnNodeStarted = (nodeStarted: NodeStartedResponse) => void
export type IOnNodeFinished = (nodeFinished: NodeFinishedResponse) => void

type IOtherOptions = {
  isPublicAPI?: boolean
  bodyStringify?: boolean
  needAllResponseContent?: boolean
  deleteContentType?: boolean
  onData?: IOnData // for stream
  onThought?: IOnThought
  onFile?: IOnFile
  onMessageEnd?: IOnMessageEnd
  onMessageReplace?: IOnMessageReplace
  onError?: IOnError
  onCompleted?: IOnCompleted // for stream
  getAbortController?: (abortController: AbortController) => void
  onWorkflowStarted?: IOnWorkflowStarted
  onWorkflowFinished?: IOnWorkflowFinished
  onNodeStarted?: IOnNodeStarted
  onNodeFinished?: IOnNodeFinished
}

function unicodeToChar(text: string) {
  return text.replace(/\\u[0-9a-f]{4}/g, (_match, p1) => {
    return String.fromCharCode(Number.parseInt(p1, 16))
  })
}

const handleStream = (
  response: Response,
  onData: IOnData,
  onCompleted?: IOnCompleted,
  onThought?: IOnThought,
  onMessageEnd?: IOnMessageEnd,
  onMessageReplace?: IOnMessageReplace,
  onFile?: IOnFile,
  onWorkflowStarted?: IOnWorkflowStarted,
  onWorkflowFinished?: IOnWorkflowFinished,
  onNodeStarted?: IOnNodeStarted,
  onNodeFinished?: IOnNodeFinished,
) => {
  if (!response.ok) { throw new Error('Network response was not ok') }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let bufferObj: Record<string, any>
  let isFirstMessage = true

  // ✅ 新增：缓存最后有效的会话ID和消息ID
  let lastValidConversationId: string | undefined
  let lastValidMessageId: string | undefined

  function read() {
    let hasError = false
    reader?.read().then((result: any) => {
      if (result.done) {
        onCompleted && onCompleted()
        return
      }

      // ✅ 改进：更安全的缓冲区处理
      const chunk = decoder.decode(result.value, { stream: true })
      buffer += chunk

      // ✅ 改进：确保完整的消息行
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个可能不完整的行

      try {
        lines.forEach((message) => {
          if (message.startsWith('data: ')) {
            const jsonStr = message.substring(6).trim()
            if (!jsonStr) { return } // 跳过空消息

            try {
              bufferObj = JSON.parse(jsonStr) as Record<string, any>
              console.log('bufferObj:', bufferObj)

              // ✅ 缓存有效的会话ID和消息ID
              if (bufferObj.conversation_id && typeof bufferObj.conversation_id === 'string') {
                lastValidConversationId = bufferObj.conversation_id
              }
              if (bufferObj.message_id && typeof bufferObj.message_id === 'string') {
                lastValidMessageId = bufferObj.message_id
              }
              if (bufferObj.id && typeof bufferObj.id === 'string') {
                lastValidMessageId = bufferObj.id
              }
            }
            catch (e) {
              console.warn('JSON.parse failed for message:', jsonStr.substring(0, 100), 'error:', e)

              // ✅ 尝试修复 JSON
              const repairedJson = tryRepairJson(jsonStr)
              if (repairedJson) {
                try {
                  bufferObj = JSON.parse(repairedJson) as Record<string, any>
                  console.log('Repaired bufferObj:', bufferObj)

                  // 同样缓存 ID
                  if (bufferObj.conversation_id && typeof bufferObj.conversation_id === 'string') {
                    lastValidConversationId = bufferObj.conversation_id
                  }
                  if (bufferObj.message_id && typeof bufferObj.message_id === 'string') {
                    lastValidMessageId = bufferObj.message_id
                  }
                  if (bufferObj.id && typeof bufferObj.id === 'string') {
                    lastValidMessageId = bufferObj.id
                  }
                  return // 修复成功，继续处理
                }
                catch (e2) {
                  console.warn('Repaired JSON still failed:', e2)
                }
              }

              // ✅ 修复失败，使用最后有效的ID
              Toast.notify({
                type: 'error',
                message: t('app.errorMessage.messageParserError'),
              })
              onData('', isFirstMessage, {
                conversationId: lastValidConversationId,
                messageId: lastValidMessageId || '',
                errorMessage: t('app.errorMessage.messageParserError'),
                errorCode: 'PARSE_ERROR',
              })

              // 如果没有有效的会话ID，标记为错误
              if (!lastValidConversationId) {
                hasError = true
              }
              return
            }
            if (bufferObj.status === 400 || !bufferObj.event) {
              onData('', false, {
                conversationId: lastValidConversationId,
                messageId: '',
                errorMessage: bufferObj?.message || '服务端返回错误',
                errorCode: bufferObj?.code,
              })
              hasError = true
              onCompleted?.(true)
              return
            }
            if (bufferObj.event === 'message' || bufferObj.event === 'agent_message') {
              // can not use format here. Because message is splited.
              onData(unicodeToChar(bufferObj.answer), isFirstMessage, {
                conversationId: bufferObj.conversation_id || lastValidConversationId,
                taskId: bufferObj.task_id,
                messageId: bufferObj.id || lastValidMessageId,
              })
              isFirstMessage = false
            }
            else if (bufferObj.event === 'agent_thought') {
              onThought?.(bufferObj as ThoughtItem)
            }
            else if (bufferObj.event === 'message_file') {
              onFile?.(bufferObj as VisionFile)
            }
            else if (bufferObj.event === 'message_end') {
              onMessageEnd?.(bufferObj as MessageEnd)
            }
            else if (bufferObj.event === 'message_replace') {
              onMessageReplace?.(bufferObj as MessageReplace)
            }
            else if (bufferObj.event === 'workflow_started') {
              onWorkflowStarted?.(bufferObj as WorkflowStartedResponse)
            }
            else if (bufferObj.event === 'workflow_finished') {
              onWorkflowFinished?.(bufferObj as WorkflowFinishedResponse)
            }
            else if (bufferObj.event === 'node_started') {
              onNodeStarted?.(bufferObj as NodeStartedResponse)
            }
            else if (bufferObj.event === 'node_finished') {
              onNodeFinished?.(bufferObj as NodeFinishedResponse)
            }
          }
        })
        buffer = lines[lines.length - 1]
      }
      catch (e) {
        console.error('handleStream error:', e)
        onData('', false, {
          conversationId: lastValidConversationId,
          messageId: lastValidMessageId || '',
          errorMessage: `流处理异常: ${e}`,
        })
        hasError = true
        onCompleted?.(true)
        return
      }
      if (!hasError) { read() }
    })
  }
  read()
}

const baseFetch = (url: string, fetchOptions: any, { needAllResponseContent, deleteContentType }: IOtherOptions) => {
  const options = Object.assign({}, baseOptions, fetchOptions)
  // 如果 deleteContentType 为 true，则删除 Content-Type header
  if (deleteContentType) { options.headers.delete('Content-Type') }

  const urlPrefix = API_PREFIX

  let urlWithPrefix = `${urlPrefix}${url.startsWith('/') ? url : `/${url}`}`

  const { method, params, body } = options
  // handle query
  if (method === 'GET' && params) {
    const paramsArray: string[] = []
    Object.keys(params).forEach(key =>
      paramsArray.push(`${key}=${encodeURIComponent(params[key])}`),
    )
    if (urlWithPrefix.search(/\?/) === -1) { urlWithPrefix += `?${paramsArray.join('&')}` }

    else { urlWithPrefix += `&${paramsArray.join('&')}` }

    delete options.params
  }
  // 关键修改：只有当 body 存在且不是 FormData 时才进行 JSON.stringify
  if (body && !(body instanceof FormData)) { options.body = JSON.stringify(body) }

  let timerOut: Timeout | null = null
  let isCompleted = false // 标记请求是否已完成
  const clearTimer = () => {
    if (!isCompleted) {
      isCompleted = true
      timerOut && clearTimeout(timerOut)
    }
  }
  // Handle timeout
  return Promise.race([
    new Promise((resolve, reject) => {
      timerOut = setTimeout(() => {
        Toast.notify({ type: 'error', message: t('app.errorMessage.overTimeError') })
        reject(new Error(t('app.errorMessage.overTimeError')))
      }, TIME_OUT)
    }),
    new Promise((resolve, reject) => {
      globalThis.fetch(urlWithPrefix, options)
        .then((res: any) => {
          clearTimer()
          const resClone = res.clone()
          // Error handler
          if (!/^(2|3)\d{2}$/.test(res.status)) {
            try {
              const bodyJson = res.json()
              console.error('bodyJson  ==>')
              console.log(res.status, bodyJson)
              switch (res.status) {
                case 401: {
                  Toast.notify({ type: 'error', message: 'Invalid token' })
                  return
                }

                case 500: {
                  Toast.notify({ type: 'error', message: 'Server error' })
                  return
                }

                default:
                  new Promise(() => {
                    bodyJson.then((data: any) => {
                      Toast.notify({ type: 'error', message: data.message })
                    })
                  })
              }
            }
            catch (e) {
              Toast.notify({ type: 'error', message: `${e}` })
            }

            return Promise.reject(resClone)
          }

          // handle delete api. Delete api not return content.
          if (res.status === 204) {
            resolve({ result: 'success' })
            return
          }

          // return data
          const data = options.headers.get('Content-type') === ContentType.download ? res.blob() : res.json()

          resolve(needAllResponseContent ? resClone : data)
        })
        .catch((err) => {
          clearTimer()
          Toast.notify({ type: 'error', message: err })
          reject(err)
        })
    }),
  ])
}

export const upload = (fetchOptions: any): Promise<any> => {
  const urlPrefix = API_PREFIX
  const urlWithPrefix = `${urlPrefix}/file-upload`
  const defaultOptions = {
    method: 'POST',
    url: `${urlWithPrefix}`,
    data: {},
    timeout: 6000, // 90秒超时
    headers: {},
    retryCount: 0,
  }
  const options = {
    ...defaultOptions,
    ...fetchOptions,
  }

  return new Promise((resolve, reject) => {
    const xhr = options.xhr
    const startTime = Date.now()
    let uploadProgress = 0
    let requestCompleted = false

    // 详细的请求信息日志
    console.log('[Upload] Starting request:', {
      url: options.url,
      method: options.method,
      timeout: options.timeout,
      fileSize: options.data instanceof FormData
        ? (Array.from(options.data.entries() as [string, any][]).reduce((size, [key, value]) => {
          return size + (value instanceof File ? value.size : 0)
        }, 0) as number) : 0,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    })

    // 错误处理函数
    const handleError = (error: any, errorType: string) => {
      if (requestCompleted) { return }

      requestCompleted = true

      const errorInfo = {
        type: errorType,
        message: error?.message || 'Unknown error',
        status: xhr?.status,
        statusText: xhr?.statusText,
        readyState: xhr?.readyState,
        response: xhr?.response,
        responseText: xhr?.responseText,
        responseType: xhr?.responseType,
        uploadProgress,
        duration: Date.now() - startTime,
        url: options.url,
        userAgent: navigator.userAgent,
        isWebView: /WebView|wv/.test(navigator.userAgent),
        deviceMemory: (navigator as any).deviceMemory,
        connectionType: (navigator as any).connection?.effectiveType,
        fileSize: options.data instanceof FormData
          ? (Array.from(options.data.entries() as [string, any][]).reduce((size, [key, value]) => {
            return size + (value instanceof File ? value.size : 0)
          }, 0) as number) : 0,
        networkType: (navigator as any).connection?.effectiveType,
        downlink: (navigator as any).connection?.downlink,
        rtt: (navigator as any).connection?.rtt,
      }

      console.error(`[Upload] ${errorType}:`, errorInfo)

      // 显示用户友好的错误提示
      let userMessage = '上传失败，请重试'

      switch (errorType) {
        case 'TIMEOUT_ERROR':
          userMessage = '上传超时，请检查网络连接'
          break
        case 'NETWORK_ERROR':
          userMessage = '网络连接失败，请检查网络'
          break
        case 'HTTP_ERROR':
          if (xhr?.status === 413) {
            userMessage = '文件过大，请选择较小的文件'
          }
          else if (xhr?.status === 401) {
            userMessage = '登录已过期，请重新登录'
          }
          else if (xhr?.status >= 500) {
            userMessage = '服务器错误，请稍后重试'
          }
          else {
            userMessage = `上传失败 (${xhr?.status || 'unknown'})`
          }
          break
        case 'ABORT_ERROR':
          userMessage = '上传已取消'
          break
        default:
          userMessage = '上传失败，请重试'
      }

      Toast.notify({ type: 'error', message: userMessage })
      reject(errorInfo)
    }

    // 打开连接
    try {
      xhr.open(options.method, options.url)
      console.log('[Upload] Connection opened successfully')
    }
    catch (error) {
      handleError(error, 'OPEN_ERROR')
      return
    }

    // 设置请求头
    try {
      for (const key in options.headers) {
        xhr.setRequestHeader(key, options.headers[key])
      }

      // 添加通用请求头
      if (!options.headers['Content-Type'] && !(options.data instanceof FormData)) {
        xhr.setRequestHeader('Content-Type', 'application/json')
      }

      // 添加用户代理信息和调试头
      xhr.setRequestHeader('X-Client-Info', JSON.stringify({
        userAgent: navigator.userAgent,
        isWebView: /WebView|wv/.test(navigator.userAgent),
        timestamp: Date.now(),
        deviceMemory: (navigator as any).deviceMemory,
        connectionType: (navigator as any).connection?.effectiveType,
      }))

      console.log('[Upload] Headers set successfully')
    }
    catch (error) {
      handleError(error, 'HEADER_ERROR')
      return
    }

    // 设置超时
    xhr.timeout = options.timeout

    // 超时处理
    xhr.ontimeout = () => {
      if (requestCompleted) { return }
      requestCompleted = true
      handleError(new Error('Request timeout'), 'TIMEOUT_ERROR')
    }

    // 网络错误处理
    xhr.onerror = () => {
      if (requestCompleted) { return }
      requestCompleted = true
      handleError(new Error('Network error'), 'NETWORK_ERROR')
    }

    // 请求中止处理
    xhr.onabort = () => {
      if (requestCompleted) { return }
      requestCompleted = true
      handleError(new Error('Request aborted'), 'ABORT_ERROR')
    }

    // 设置凭据
    xhr.withCredentials = true

    // 状态变化监听
    xhr.onreadystatechange = function () {
      console.log(`[Upload] State changed: ${xhr.readyState}`, {
        status: xhr.status,
        statusText: xhr.statusText,
        readyState: xhr.readyState,
        duration: Date.now() - startTime,
        uploadProgress,
      })

      if (xhr.readyState === 4) {
        if (requestCompleted) { return }
        requestCompleted = true

        // 检查是否为超时或网络错误（status 为 0 通常表示网络问题）
        if (xhr.status === 0) {
          console.error('Network error or timeout')
          handleError(new Error('Network error or timeout'), 'NETWORK_ERROR')
        }
        else if (xhr.status === 200) {
          try {
            console.log('[Upload] Request completed successfully:', {
              status: xhr.status,
              response: xhr.response,
              duration: Date.now() - startTime,
              uploadProgress,
            })

            // 尝试解析响应
            let response
            if (typeof xhr.response === 'string') {
              try {
                response = JSON.parse(xhr.response)
              }
              catch {
                response = xhr.response
              }
            }
            else {
              response = xhr.response
            }

            resolve(response)
          }
          catch (error) {
            handleError(error, 'RESPONSE_PARSE_ERROR')
          }
        }
        else {
          handleError(xhr, 'HTTP_ERROR')
        }
      }
    }

    // 上传进度监听
    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        uploadProgress = Math.round((event.loaded / event.total) * 100)
        console.log('[Upload] Upload progress:', {
          loaded: event.loaded,
          total: event.total,
          progress: uploadProgress,
          duration: Date.now() - startTime,
        })
      }

      if (options.onprogress) {
        options.onprogress(event)
      }
    }

    // 下载进度监听
    xhr.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        console.log('[Upload] Download progress:', {
          loaded: event.loaded,
          total: event.total,
          duration: Date.now() - startTime,
        })
      }
    }

    // 发送请求
    try {
      console.log('[Upload] Sending request...')
      xhr.send(options.data)
    }
    catch (error) {
      handleError(error, 'SEND_ERROR')
    }

    // 清理函数
    return () => {
      if (!requestCompleted) {
        requestCompleted = true
        xhr.abort()
        console.log('[Upload] Request aborted')
      }
    }
  })
}

export const ssePost = (
  url: string,
  fetchOptions: any,
  {
    onData,
    onCompleted,
    onThought,
    onFile,
    onMessageEnd,
    onMessageReplace,
    onWorkflowStarted,
    onWorkflowFinished,
    onNodeStarted,
    onNodeFinished,
    onError,
  }: IOtherOptions,
) => {
  const options = Object.assign({}, baseOptions, {
    method: 'POST',
  }, fetchOptions)

  const urlPrefix = API_PREFIX
  const urlWithPrefix = `${urlPrefix}${url.startsWith('/') ? url : `/${url}`}`

  const { body } = options
  if (body) { options.body = JSON.stringify(body) }

  globalThis.fetch(urlWithPrefix, options)
    .then((res: any) => {
      if (!/^(2|3)\d{2}$/.test(res.status)) {
        new Promise(() => {
          res.json().then((data: any) => {
            Toast.notify({ type: 'error', message: data.message || 'Server Error' })
          })
        })
        onError?.('Server Error')
        return
      }
      return handleStream(res, (str: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
        if (moreInfo.errorMessage) {
          Toast.notify({ type: 'error', message: moreInfo.errorMessage })
          onCompleted?.(true) // ✅ 重置按钮状态
          return
        }
        onData?.(str, isFirstMessage, moreInfo)
      }, () => {
        onCompleted?.()
      }, onThought, onMessageEnd, onMessageReplace, onFile, onWorkflowStarted, onWorkflowFinished, onNodeStarted, onNodeFinished)
    }).catch((e) => {
      Toast.notify({ type: 'error', message: e })
      onCompleted?.(true) // ✅ 重置按钮状态
      onError?.(e)
    })
}

export const request = (url: string, options = {}, otherOptions?: IOtherOptions) => {
  return baseFetch(url, options, otherOptions || {})
}

export const get = (url: string, options = {}, otherOptions?: IOtherOptions) => {
  return request(url, Object.assign({}, options, { method: 'GET' }), otherOptions)
}

export const post = (url: string, options = {}, otherOptions?: IOtherOptions) => {
  return request(url, Object.assign({}, options, { method: 'POST' }), otherOptions)
}

export const put = (url: string, options = {}, otherOptions?: IOtherOptions) => {
  return request(url, Object.assign({}, options, { method: 'PUT' }), otherOptions)
}

export const del = (url: string, options = {}, otherOptions?: IOtherOptions) => {
  return request(url, Object.assign({}, options, { method: 'DELETE' }), otherOptions)
}
/**
 * 发送 multipart/form-data 请求
 * @param url 请求地址
 * @param formData FormData 对象
 * @param otherOptions 其他选项
 * @returns Promise
 */
export const postForm = (
  url: string,
  formData: FormData,
  otherOptions?: Omit<IOtherOptions, 'bodyStringify'>,
): Promise<any> => {
  // 创建不包含 Content-Type 的 headers，让浏览器自动设置 multipart/form-data 及 boundary
  // 强制设置为 multipart/form-data
  // headers.set('Content-Type', 'multipart/form-data')

  const options = {
    method: 'POST',
    body: formData,
  }
  const finalOptions = {
    ...otherOptions,
    deleteContentType: true,
  }
  return baseFetch(url, options, finalOptions || { deleteContentType: true })
}
