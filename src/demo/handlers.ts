import { delay, http, HttpResponse } from 'msw'
import { DEMO_ANSWERS, DEMO_FOLLOWUPS, DEMO_PARAMETERS, detectLang, detectScenario } from './content'
import { getDemoLang } from './bridge'
import { demoStore } from './store'
import type { DemoMessage } from './types'

const basePath = process.env.NEXT_PUBLIC_NODE_BASE_PATH || '/tubo-app'
const api = `${basePath}/api`

const tasks = new Map<string, { stopped: boolean }>()

function id(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function chunks(text: string) {
  const parts: string[] = []
  let index = 0
  while (index < text.length) {
    const size = 1 + Math.floor(Math.random() * 5)
    parts.push(text.slice(index, index + size))
    index += size
  }
  return parts
}

function demoSpeed() {
  const speed = Number(new URLSearchParams(location.search).get('demoSpeed'))
  return speed > 0 ? speed : 1
}

export const demoHandlers = [
  http.get(`${api}/parameters`, async () => {
    await delay(120)
    return HttpResponse.json(DEMO_PARAMETERS)
  }),

  http.get(`${api}/conversations`, async () => {
    await delay(150)
    return HttpResponse.json({ limit: 20, has_more: false, data: demoStore.list() })
  }),

  http.get(`${api}/messages`, async ({ request }) => {
    await delay(160)
    const url = new URL(request.url)
    const conversationId = url.searchParams.get('conversation_id') || ''
    const firstId = url.searchParams.get('first_id')
    const limit = Number(url.searchParams.get('limit')) || 5
    let list = demoStore.messages(conversationId)
    if (firstId && firstId !== 'undefined' && firstId !== 'null') {
      const index = list.findIndex(item => item.id === firstId)
      list = index >= 0 ? list.slice(0, index) : []
    }
    const page = list.slice(-limit)
    return HttpResponse.json({ limit, has_more: list.length > page.length, data: page })
  }),

  http.post(`${api}/conversations/:id/name`, async ({ params, request }) => {
    await delay(200)
    const body = await request.json().catch(() => ({})) as { auto_generate?: boolean, name?: string }
    const conversationId = String(params.id)
    const conversation = demoStore.get(conversationId)
    if (!conversation)
      return HttpResponse.json({ message: 'not found' }, { status: 404 })
    if (body?.auto_generate) {
      const query = demoStore.messages(conversationId)[0]?.query || conversation.name
      demoStore.rename(conversationId, query.length > 14 ? `${query.slice(0, 14)}…` : query)
    }
    else if (body?.name) {
      demoStore.rename(conversationId, String(body.name))
    }
    return HttpResponse.json(demoStore.get(conversationId))
  }),

  http.delete(`${api}/conversations/:id`, async ({ params }) => {
    await delay(150)
    demoStore.remove(String(params.id))
    return HttpResponse.json({ result: 'success' })
  }),

  http.post(`${api}/messages/:id/feedbacks`, async ({ params, request }) => {
    await delay(180)
    const body = await request.json() as { rating?: string | null }
    const message = demoStore.findMessage(String(params.id))
    if (message)
      message.feedback = body.rating ? { rating: body.rating } : null
    demoStore.save()
    return HttpResponse.json({ result: 'success' })
  }),

  http.get(`${api}/suggested-questions/:id`, async ({ params }) => {
    await delay(300)
    const message = demoStore.findMessage(String(params.id))
    const scenario = message?.scenario || 'generic'
    const lang = message?.lang || getDemoLang()
    return HttpResponse.json({ result: 'success', data: DEMO_FOLLOWUPS[scenario][lang] })
  }),

  http.post(`${api}/chat-messages/:taskId/stop`, async ({ params }) => {
    const task = tasks.get(String(params.taskId))
    if (task)
      task.stopped = true
    return HttpResponse.json({ result: 'success' })
  }),

  http.post(`${api}/chat-messages`, async ({ request }) => {
    const body = await request.json() as { query?: string, conversation_id?: string, inputs?: Record<string, unknown> }
    const query = body?.query || ''
    let conversationId = body?.conversation_id && body.conversation_id !== '-1' ? body.conversation_id : ''
    if (!conversationId || !demoStore.get(conversationId)) {
      const name = query.length > 14 ? `${query.slice(0, 14)}…` : (query || 'New chat')
      conversationId = demoStore.create(name).id
    }

    const lang = detectLang(query, getDemoLang())
    const scenario = detectScenario(query)
    const answer = DEMO_ANSWERS[scenario][lang]
    const taskId = id('task')
    const messageId = id('msg')
    const createdAt = Math.floor(Date.now() / 1000)
    const message: DemoMessage = {
      id: messageId,
      conversation_id: conversationId,
      query,
      answer: '',
      feedback: null,
      created_at: createdAt,
      message_files: [],
      agent_thoughts: [],
      retriever_resources: [],
      inputs: body?.inputs || {},
      scenario,
      lang,
    }
    demoStore.addMessage(message)

    const task = { stopped: false }
    tasks.set(taskId, task)
    const encoder = new TextEncoder()
    const frame = (payload: unknown) => encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
    const pieces = chunks(answer)
    const speed = demoSpeed()

    const stream = new ReadableStream({
      async start(controller) {
        await delay(Math.round(650 / speed))
        let full = ''
        for (const piece of pieces) {
          if (task.stopped)
            break
          full += piece
          controller.enqueue(frame({
            event: 'message',
            task_id: taskId,
            id: messageId,
            message_id: messageId,
            conversation_id: conversationId,
            answer: piece,
            created_at: createdAt,
          }))
          const pause = /[\n。！？.!?|]/.test(piece) ? 70 : 28 + 30 * Math.random()
          await delay(Math.round(pause / speed))
        }
        const saved = demoStore.findMessage(messageId)
        if (saved) {
          saved.answer = full
          demoStore.save()
        }
        controller.enqueue(frame({
          event: 'message_end',
          task_id: taskId,
          id: messageId,
          message_id: messageId,
          conversation_id: conversationId,
          metadata: {
            usage: {
              prompt_tokens: 312,
              completion_tokens: Math.round(full.length / 1.6),
              total_tokens: 312 + Math.round(full.length / 1.6),
              currency: 'USD',
              total_price: '0',
            },
            retriever_resources: [],
          },
        }))
        tasks.delete(taskId)
        controller.close()
      },
      cancel() {
        task.stopped = true
      },
    })

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  }),

  http.post(`${api}/audio-to-text`, async () => {
    await delay(600)
    return HttpResponse.json({ text: '充电宝能寄吗？' })
  }),

  http.post(`${api}/file-upload`, async () => {
    await delay(400)
    return HttpResponse.json({
      id: id('file'),
      name: 'demo.jpg',
      size: 102400,
      extension: 'jpg',
      mime_type: 'image/jpeg',
    })
  }),

  http.all(`${api}/*`, ({ request }) => {
    console.warn('[demo] unhandled API', request.method, request.url)
    return HttpResponse.json({ result: 'success' })
  }),
]
