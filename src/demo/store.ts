import type { DemoConversation, DemoMessage } from './types'

const STORAGE_KEY = 'demo-courier-store:v1'

type Store = {
  seq: number
  conversations: DemoConversation[]
  messages: Record<string, DemoMessage[]>
}

function now() {
  return Math.floor(Date.now() / 1000)
}

function emptyStore(): Store {
  if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('seed') === '1') {
    const ts = now()
    const older: DemoConversation = {
      id: 'conv-demo-seed-1',
      name: '充电宝收寄规则',
      inputs: {},
      status: 'normal',
      introduction: '',
      created_at: ts - 86400,
      updated_at: ts - 86400,
    }
    const newer: DemoConversation = {
      id: 'conv-demo-seed-2',
      name: '滨江花园门牌确认',
      inputs: {},
      status: 'normal',
      introduction: '',
      created_at: ts - 172800,
      updated_at: ts - 172800,
    }
    const message = (
      conversation: DemoConversation,
      id: string,
      query: string,
      answer: string,
      offset: number,
    ): DemoMessage => ({
      id,
      conversation_id: conversation.id,
      query,
      answer,
      feedback: null,
      created_at: conversation.created_at + offset,
      message_files: [],
      agent_thoughts: [],
      retriever_resources: [],
      inputs: {},
    })
    return {
      seq: 1,
      conversations: [older, newer],
      messages: {
        [older.id]: [message(older, 'msg-seed-1', '充电宝能寄吗？', '演示规则下：**≤ 20000mAh** 且有原包装、标签清晰的可以限量收寄；超过的不可收。', 10)],
        [newer.id]: [message(newer, 'msg-seed-2', '滨江花园 6 栋在哪个门进？', '建议从 **北门** 进入，6 栋在北门右手边第二栋，门禁呼叫 0602（演示数据）。', 10)],
      },
    }
  }
  return { seq: 1, conversations: [], messages: {} }
}

let store: Store | null = null

function read(): Store {
  if (store)
    return store
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    store = raw ? JSON.parse(raw) as Store : emptyStore()
  }
  catch {
    store = emptyStore()
  }
  return store
}

function save() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }
  catch {
    // sessionStorage can be unavailable in a locked-down iframe.
  }
}

export const demoStore = {
  list() {
    return [...read().conversations].sort((a, b) => b.updated_at - a.updated_at)
  },
  get(id: string) {
    return read().conversations.find(item => item.id === id)
  },
  create(name: string) {
    const current = read()
    current.seq += 1
    const conversation: DemoConversation = {
      id: `conv-demo-${Date.now().toString(36)}-${current.seq}`,
      name,
      inputs: {},
      status: 'normal',
      introduction: '',
      created_at: now(),
      updated_at: now(),
    }
    current.conversations.push(conversation)
    current.messages[conversation.id] = []
    save()
    return conversation
  },
  rename(id: string, name: string) {
    const conversation = this.get(id)
    if (conversation)
      conversation.name = name
    save()
    return conversation
  },
  remove(id: string) {
    const current = read()
    current.conversations = current.conversations.filter(item => item.id !== id)
    delete current.messages[id]
    save()
  },
  messages(id: string) {
    return read().messages[id] || []
  },
  addMessage(message: DemoMessage) {
    const current = read()
    const list = current.messages[message.conversation_id] || []
    current.messages[message.conversation_id] = list
    list.push(message)
    const conversation = this.get(message.conversation_id)
    if (conversation)
      conversation.updated_at = now()
    save()
  },
  findMessage(id: string) {
    for (const list of Object.values(read().messages)) {
      const found = list.find(item => item.id === id)
      if (found)
        return found
    }
    return undefined
  },
  save,
}
