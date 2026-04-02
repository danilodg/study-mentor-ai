import { PanelLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChatWorkspaceContext } from '../../context/ChatWorkspaceContext'
import { truncateIdentity } from '../../utils/user'

export function ChatHeader() {
  const navigate = useNavigate()
  const {
    language,
    t,
    sessionEmail,
    sessionDisplayName,
    setIsMobileConversationMenuOpen,
  } = useChatWorkspaceContext()

  const accountLabel = sessionEmail
    ? truncateIdentity(sessionDisplayName || sessionEmail, 18)
    : (language === 'pt' ? 'Entrar' : 'Sign in')

  return (
    <div className="flex h-[60px] items-center gap-2 border-b border-[color:var(--panel-border)]">
      <button
        type="button"
        onClick={() => setIsMobileConversationMenuOpen(true)}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--card-border)] bg-transparent text-[color:var(--text-main)] transition hover:-translate-y-0.5 lg:hidden"
        aria-label={language === 'pt' ? 'Abrir conversas' : 'Open conversations'}
      >
        <PanelLeft size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-['Space_Grotesk'] text-[1rem] font-bold tracking-[-0.02em] text-[color:var(--text-main)] sm:text-[1.1rem] lg:text-[1.3rem]">
          {t.workspaceTitle}
        </h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => navigate(sessionEmail ? '/profile' : '/auth')}
          className="inline-flex items-center rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 text-xs font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 sm:text-sm"
          title={sessionEmail ? (sessionDisplayName || sessionEmail) : undefined}
        >
          {accountLabel}
        </button>
      </div>
    </div>
  )
}
