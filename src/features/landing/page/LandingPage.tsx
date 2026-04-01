import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../../context/AppContext'
import { LandingScreen } from '../../../components/LandingScreen'

export function LandingPage() {
  const navigate = useNavigate()
  const { app, conversationSummaries } = useAppContext()

  function goToChatWithAuthGate() {
    if (app.isSupabaseConfigured && !app.session) {
      navigate('/auth')
      return
    }

    navigate('/chat')
  }

  return (
    <LandingScreen
      language={app.language}
      t={app.t}
      sessionEmail={app.session?.user.email}
      conversationList={conversationSummaries}
      onOpenNewConversation={app.openNewConversationModal}
      onSelectConversation={(conversationId) => {
        app.setActiveConversationId(conversationId)
        app.setDraft('')
        goToChatWithAuthGate()
      }}
      onPrimaryAction={goToChatWithAuthGate}
      onSecondaryAction={() => {
        app.setDraft(app.t.quickPrompts[1])
        goToChatWithAuthGate()
      }}
      onAccountAction={() => navigate(app.session ? '/profile' : '/auth')}
      onQuickPromptAction={(prompt) => {
        void app.submitMessage(prompt)
        goToChatWithAuthGate()
      }}
    />
  )
}
