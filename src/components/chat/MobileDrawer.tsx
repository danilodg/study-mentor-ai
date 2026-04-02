import { ArrowLeft, MoonStar, MoreHorizontal, SunMedium } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChatWorkspaceContext } from '../../context/ChatWorkspaceContext'
import { getConversationDisplayTitle } from '../../utils/conversation'

export function MobileDrawer() {
  const navigate = useNavigate()
  const {
    language,
    switchLanguage,
    theme,
    setTheme,
    t,
    isMobileConversationMenuOpen,
    setIsMobileConversationMenuOpen,
    conversationList,
    activeConversationId,
    setActiveConversationId,
    deleteConversation,
    openNewConversationModal,
  } = useChatWorkspaceContext()

  if (!isMobileConversationMenuOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/45 lg:hidden"
      onClick={() => setIsMobileConversationMenuOpen(false)}
    >
      <aside
        className="app-scroll absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col overflow-y-auto rounded-r-[10px] border border-[color:var(--panel-border)] bg-[color:var(--mobile-drawer-bg)] p-3 shadow-[0_22px_60px_rgba(8,14,34,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[color:var(--panel-border)] pb-3">
          <button
            type="button"
            onClick={() => setIsMobileConversationMenuOpen(false)}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[color:var(--card-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--text-main)]"
          >
            <ArrowLeft size={14} />
            {language === 'pt' ? 'Voltar' : 'Back'}
          </button>
          <button
            type="button"
            onClick={() => {
              navigate('/')
              setIsMobileConversationMenuOpen(false)
            }}
            className="inline-flex items-center rounded-[10px] border border-[color:var(--card-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--text-main)]"
          >
            {language === 'pt' ? 'Inicio' : 'Home'}
          </button>
        </div>

        <section className="mt-3 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--mobile-drawer-card-bg)] p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="section-label">{language === 'pt' ? 'Conversas' : 'Conversations'}</span>
            <button
              type="button"
              onClick={() => {
                openNewConversationModal()
                setIsMobileConversationMenuOpen(false)
              }}
               className="inline-flex items-center rounded-[10px] border border-[color:var(--card-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--text-main)]"
            >
              {t.newChat}
            </button>
          </div>

          <div className="mt-3 grid min-w-0 gap-2">
            {conversationList.map((conversation, index) => (
              <article
                key={conversation.id}
                className={[
                  'glass-card w-full min-w-0 rounded-[10px] p-1.5',
                  conversation.id === activeConversationId ? 'border-[color:var(--accent-line)]/45' : '',
                ].join(' ')}
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveConversationId(conversation.id)
                      setIsMobileConversationMenuOpen(false)
                    }}
                    className="min-w-0 flex-1 rounded-[10px] px-2 py-1.5 text-left"
                  >
                    <p className="truncate text-sm font-medium text-[color:var(--text-main)]">
                      {getConversationDisplayTitle(conversation.title, t.newChat, conversationList.length, index)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(language === 'pt' ? 'Excluir esta conversa?' : 'Delete this conversation?')) {
                        deleteConversation(conversation.id)
                      }
                    }}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[color:var(--card-border)] text-[color:var(--text-muted)]"
                    aria-label={language === 'pt' ? 'Excluir conversa' : 'Delete conversation'}
                    title={language === 'pt' ? 'Excluir conversa' : 'Delete conversation'}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--mobile-drawer-card-bg)] p-2">
          <span className="section-label">{language === 'pt' ? 'Preferencias' : 'Preferences'}</span>

          <div className="mt-2 grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                {language === 'pt' ? 'Idioma' : 'Language'}
              </p>
              <div className="grid grid-cols-2 rounded-[10px] border border-[color:var(--card-border)] p-1">
                {(['pt', 'en'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => switchLanguage(option)}
                    className={[
                      'rounded-[10px] px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em]',
                      language === option
                        ? 'accent-button text-white'
                        : 'text-[color:var(--text-soft)]',
                    ].join(' ')}
                  >
                    {option.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              className="inline-flex items-center justify-between rounded-[10px] border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)]"
            >
              <span>{language === 'pt' ? 'Tema' : 'Theme'}</span>
              <span className="inline-flex items-center gap-2">
                {theme === 'dark' ? <SunMedium size={14} /> : <MoonStar size={14} />}
                {theme === 'dark'
                  ? (language === 'pt' ? 'Claro' : 'Light')
                  : (language === 'pt' ? 'Escuro' : 'Dark')}
              </span>
            </button>
          </div>
        </section>
      </aside>
    </div>
  )
}
