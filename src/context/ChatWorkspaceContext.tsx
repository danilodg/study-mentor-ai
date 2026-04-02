import { createContext, useContext } from 'react'
import type { FormEvent, RefObject, ReactNode } from 'react'
import type { Components } from 'react-markdown'
import type { Conversation, CopyBlock, Message, QuizOptionId, ResponseMode, Theme } from '../types/chat'

export interface ChatWorkspaceContextValue {
  language: 'pt' | 'en'
  switchLanguage: (nextLanguage: 'pt' | 'en') => void
  theme: Theme
  setTheme: (value: Theme | ((current: Theme) => Theme)) => void
  t: CopyBlock
  isDesktopSidebarPinned: boolean
  isDesktopSidebarOpen: boolean
  setIsDesktopSidebarPinned: (updater: (current: boolean) => boolean) => void
  setIsDesktopSidebarHovered: (value: boolean) => void
  isMobileConversationMenuOpen: boolean
  setIsMobileConversationMenuOpen: (value: boolean) => void
  openNewConversationModal: () => void
  isLoading: boolean
  conversationList: Array<{ id: string; title: string }>
  activeConversationId: string
  setActiveConversationId: (id: string) => void
  deleteConversation: (id: string) => void
  responseModeOptions: ResponseMode[]
  responseMode: ResponseMode
  setResponseMode: (mode: ResponseMode) => void
  responseModeLabel: Record<'pt' | 'en', Record<ResponseMode, string>>
  sessionEmail?: string
  sessionDisplayName?: string
  showStickyPassagePanel: boolean
  examPassage?: string
  visibleMessages: Message[]
  selectQuizOption: (messageId: string, optionId: QuizOptionId) => void
  selectTrueFalseOption: (messageId: string, selectedValue: boolean) => void
  submitOrderingAnswer: (messageId: string, answer: string[]) => void
  submitMatchPairsAnswer: (messageId: string, answer: Record<string, string>) => void
  submitClozeAnswer: (messageId: string, answer: Record<string, string>) => void
  retryAssistantMessage: (message: Message) => Promise<void>
  nowMs: number
  markdownComponents: Components
  markdownInlineComponents: Components
  activeConversation?: Conversation
  generateExamQuestion: (conversationId: string, nextQuestionNumber: number) => Promise<void>
  hasPendingExamMessage: boolean
  draft: string
  setDraft: (value: string) => void
  resizeDraftTextarea: (element: HTMLTextAreaElement) => void
  draftTextareaRef: RefObject<HTMLTextAreaElement | null>
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  userPlan: 'free' | 'pro'
  isCloudSyncEnabled: boolean
  setIsCloudSyncEnabled: (updater: (current: boolean) => boolean) => void
  cloudSyncTimeText: string
  signOutFromCloud: () => Promise<void>
  authEmail: string
  setAuthEmail: (value: string) => void
  authPassword: string
  setAuthPassword: (value: string) => void
  authError: string
  isAuthBusy: boolean
  signInWithGoogle: (language: 'pt' | 'en') => Promise<void>
  signInWithEmail: (email: string, password: string, language: 'pt' | 'en') => Promise<void>
  signUpWithEmail: (email: string, password: string, language: 'pt' | 'en') => Promise<void>
}

const ChatWorkspaceContext = createContext<ChatWorkspaceContextValue | null>(null)

interface ChatWorkspaceProviderProps {
  value: ChatWorkspaceContextValue
  children: ReactNode
}

export function ChatWorkspaceProvider({ value, children }: ChatWorkspaceProviderProps) {
  return <ChatWorkspaceContext.Provider value={value}>{children}</ChatWorkspaceContext.Provider>
}

export function useChatWorkspaceContext() {
  const context = useContext(ChatWorkspaceContext)

  if (!context) {
    throw new Error('useChatWorkspaceContext must be used within ChatWorkspaceProvider')
  }

  return context
}
