'use client'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'

type SendingContextType = {
  isSendingMessage: boolean
  setIsSendingMessage: (sending: boolean) => void
}

const SendingContext = createContext<SendingContextType | undefined>(undefined)

export function SendingProvider({ children }: { children: ReactNode }) {
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  return (
    <SendingContext.Provider value={{ isSendingMessage, setIsSendingMessage }}>
      {children}
    </SendingContext.Provider>
  )
}

export function useSending() {
  const context = useContext(SendingContext)
  if (context === undefined) {
    throw new Error('useSending must be used within a SendingProvider')
  }
  return context
}
