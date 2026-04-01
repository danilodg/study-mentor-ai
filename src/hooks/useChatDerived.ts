import { useMemo } from 'react'
import type { Conversation } from '../types/chat'

export function useChatDerived(conversations: Conversation[], activeConversationId: string) {
  const conversationList = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  )

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations],
  )

  return {
    conversationList,
    activeConversation,
  }
}
