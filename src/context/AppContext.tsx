import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { useChatApp } from '../hooks/useChatApp'

type ChatAppState = ReturnType<typeof useChatApp>

interface AppContextValue {
  app: ChatAppState
  conversationSummaries: Array<{ id: string; title: string }>
}

const AppContext = createContext<AppContextValue | null>(null)

interface AppProviderProps {
  value: AppContextValue
  children: ReactNode
}

export function AppProvider({ value, children }: AppProviderProps) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }

  return context
}
