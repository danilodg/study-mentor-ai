import { ChatWorkspace } from '../components/ChatWorkspace'
import { ChatWorkspaceProvider } from '../context/ChatWorkspaceContext'
import type { ChatWorkspaceContextValue } from '../context/ChatWorkspaceContext'

interface ChatPageProps {
  workspaceValue: ChatWorkspaceContextValue
}

export function ChatPage({ workspaceValue }: ChatPageProps) {
  return (
    <ChatWorkspaceProvider value={workspaceValue}>
      <ChatWorkspace />
    </ChatWorkspaceProvider>
  )
}
