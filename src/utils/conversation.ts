export function getConversationDisplayTitle(
  title: string,
  newChatLabel: string,
  totalConversations: number,
  index: number,
) {
  return title || `${newChatLabel} ${totalConversations - index}`
}
