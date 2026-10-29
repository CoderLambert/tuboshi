export type DemoLang = 'CN' | 'EN' | 'PT'
export type DemoScenario = 'route' | 'dangerous' | 'fee' | 'generic'

export type BridgeLogEntry = {
  t: number
  method: string
  params: unknown
  result: unknown
}

export type DemoMessage = {
  id: string
  conversation_id: string
  query: string
  answer: string
  feedback: { rating: string } | null
  created_at: number
  message_files: unknown[]
  agent_thoughts: unknown[]
  retriever_resources: unknown[]
  inputs: Record<string, unknown>
  scenario?: DemoScenario
  lang?: DemoLang
}

export type DemoConversation = {
  id: string
  name: string
  inputs: Record<string, unknown>
  status: string
  introduction: string
  created_at: number
  updated_at: number
}
