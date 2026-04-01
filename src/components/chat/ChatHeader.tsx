import { ArrowLeft, PanelLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChatWorkspaceContext } from '../../context/ChatWorkspaceContext'

export function ChatHeader() {
  const navigate = useNavigate()
  const {
    language,
    t,
    sessionEmail,
    setIsMobileConversationMenuOpen,
  } = useChatWorkspaceContext()

  return (
    <div className="flex items-center gap-2 border-b border-[color:var(--panel-border)] pb-1.5 sm:pb-2">
      <button
        type="button"
        onClick={() => setIsMobileConversationMenuOpen(true)}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--card-border)] bg-transparent text-[color:var(--text-main)] transition hover:-translate-y-0.5 lg:hidden"
        aria-label={language === 'pt' ? 'Abrir conversas' : 'Open conversations'}
      >
        <PanelLeft size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <span className="section-label hidden lg:inline-flex">{t.brandLabel}</span>
        <h2 className="truncate font-['Space_Grotesk'] text-[1.06rem] font-bold tracking-[-0.03em] text-[color:var(--text-main)] sm:text-[1.2rem] lg:mt-2 lg:text-[1.7rem] lg:tracking-[-0.04em]">
          {t.workspaceTitle}
        </h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => navigate(sessionEmail ? '/profile' : '/auth')}
          className="inline-flex items-center rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 text-xs font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 sm:text-sm"
        >
          {sessionEmail
            ? (language === 'pt' ? 'Conta' : 'Account')
            : (language === 'pt' ? 'Entrar' : 'Sign in')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="hidden items-center gap-2 rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 text-sm font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 lg:inline-flex"
        >
          <ArrowLeft size={16} />
          {language === 'pt' ? 'Voltar' : 'Back'}
        </button>
        <div className="hidden rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)] sm:inline-flex">
          <Sparkles size={14} className="mr-2" />
          {t.chatBadge}
        </div>
      </div>
    </div>
  )
}
