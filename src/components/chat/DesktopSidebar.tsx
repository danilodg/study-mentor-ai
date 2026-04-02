import { MoreHorizontal, PanelLeft, Plus, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChatWorkspaceContext } from '../../context/ChatWorkspaceContext'
import { getConversationDisplayTitle } from '../../utils/conversation'

export function DesktopSidebar() {
  const navigate = useNavigate()
  const {
    language,
    t,
    isDesktopSidebarOpen,
    setIsDesktopSidebarPinned,
    setIsDesktopSidebarHovered,
    openNewConversationModal,
    isLoading,
    conversationList,
    activeConversationId,
    setActiveConversationId,
    deleteConversation,
    userPlan,
    cloudSyncTimeText,
    sessionEmail,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authError,
    isAuthBusy,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useChatWorkspaceContext()

  return (
    <section className="relative hidden min-h-0 lg:order-1 lg:block">
      <div
        className="relative h-full"
        onMouseEnter={() => setIsDesktopSidebarHovered(true)}
        onMouseLeave={() => setIsDesktopSidebarHovered(false)}
      >
        <aside className="glass-panel flex h-full flex-col overflow-hidden rounded-[10px] p-2">
          <div className="flex flex-col gap-2">
            {isDesktopSidebarOpen ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex h-11 min-w-0 flex-1 items-center rounded-[10px] border border-[color:var(--card-border)] bg-transparent px-3 text-left text-sm text-[color:var(--text-main)] transition hover:bg-[color:var(--input-bg)]"
                  title={t.brandLabel}
                >
                  <span className="truncate">{t.brandLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDesktopSidebarPinned((current) => !current)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[color:var(--card-border)] bg-transparent text-[color:var(--text-main)] transition hover:bg-[color:var(--input-bg)]"
                  aria-label={language === 'pt' ? 'Fixar menu lateral' : 'Pin sidebar'}
                  title={language === 'pt' ? 'Fixar menu lateral' : 'Pin sidebar'}
                >
                  <PanelLeft size={17} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsDesktopSidebarPinned((current) => !current)}
                className="inline-flex h-11 w-full items-center justify-start rounded-[10px] border border-[color:var(--card-border)] bg-transparent px-3 text-sm text-[color:var(--text-main)] transition hover:bg-[color:var(--input-bg)]"
                aria-label={language === 'pt' ? 'Alternar menu lateral' : 'Toggle sidebar'}
                title={language === 'pt' ? 'Fixar menu' : 'Pin sidebar'}
              >
                <PanelLeft size={17} className="shrink-0" />
              </button>
            )}

            <button
              type="button"
              onClick={openNewConversationModal}
              disabled={isLoading}
              className={[
                'inline-flex h-11 items-center rounded-[10px] border border-[color:var(--card-border)] bg-transparent text-sm text-[color:var(--text-main)] transition hover:bg-[color:var(--input-bg)] disabled:cursor-not-allowed disabled:opacity-70',
                isDesktopSidebarOpen
                  ? 'w-full justify-start gap-2 px-3'
                  : 'w-full justify-start px-3',
              ].join(' ')}
              aria-label={language === 'pt' ? 'Nova conversa' : 'New chat'}
              title={t.newChat}
            >
              <Plus size={17} className="shrink-0" />
              {isDesktopSidebarOpen ? <span>{t.newChat}</span> : null}
            </button>
          </div>

          {isDesktopSidebarOpen ? (
            <>
              <div className="app-scroll mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
                <section className="rounded-[10px] border border-[color:var(--card-border)] bg-transparent p-2">
                  <span className="section-label">{language === 'pt' ? 'Conversas' : 'Conversations'}</span>

                  <div className="mt-2 grid min-w-0 gap-2">
                    {conversationList.length > 0 ? conversationList.map((conversation, index) => (
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
                            onClick={() => setActiveConversationId(conversation.id)}
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
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[color:var(--card-border)] text-[color:var(--text-muted)] transition hover:text-[color:var(--text-main)]"
                            aria-label={language === 'pt' ? 'Excluir conversa' : 'Delete conversation'}
                            title={language === 'pt' ? 'Excluir conversa' : 'Delete conversation'}
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </article>
                    )) : (
                      <article className="glass-card rounded-[10px] p-2 text-sm leading-6 text-[color:var(--text-muted)]">
                        {language === 'pt'
                          ? 'As conversas vao aparecer aqui conforme voce usa o chat.'
                          : 'Conversations appear here as you keep using the chat.'}
                      </article>
                    )}
                  </div>
                </section>
              </div>

              <section className="mt-2 shrink-0 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="section-label">{language === 'pt' ? 'Perfil' : 'Profile'}</span>
                  {sessionEmail ? (
                    <button
                      type="button"
                      onClick={() => navigate('/profile')}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-[color:var(--card-border)] text-[color:var(--text-muted)]"
                      aria-label={language === 'pt' ? 'Abrir perfil' : 'Open profile'}
                      title={language === 'pt' ? 'Abrir perfil' : 'Open profile'}
                    >
                      <Settings size={14} />
                    </button>
                  ) : null}
                </div>

                {sessionEmail ? (
                  <div className="mt-2 grid gap-2">
                    <div className="flex items-center justify-between gap-2 rounded-[10px] border border-[color:var(--card-border)] bg-transparent px-2 py-2">
                      <p className="truncate text-sm font-medium text-[color:var(--text-main)]">{sessionEmail}</p>
                      <span className="rounded-[10px] border border-[color:var(--card-border)] px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--text-muted)]">
                        {userPlan === 'pro' ? 'PRO' : 'FREE'}
                      </span>
                    </div>
                    <p className="text-xs text-[color:var(--text-muted)]">
                      {userPlan === 'pro'
                        ? (language === 'pt' ? 'Sincronizacao em nuvem disponivel' : 'Cloud sync available')
                        : (language === 'pt' ? 'Plano free: dados locais (sem nuvem)' : 'Free plan: local data only (no cloud sync)')}
                      {cloudSyncTimeText
                        ? ` • ${language === 'pt' ? 'Ultimo sync' : 'Last sync'}: ${cloudSyncTimeText}`
                        : ''}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 grid gap-2 rounded-[10px] border border-[color:var(--card-border)] bg-transparent p-2">
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(event) => setAuthEmail(event.target.value)}
                      placeholder={language === 'pt' ? 'Seu email' : 'Your email'}
                      className="rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-2 py-2 text-sm text-[color:var(--text-main)] outline-none"
                    />
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(event) => setAuthPassword(event.target.value)}
                      placeholder={language === 'pt' ? 'Sua senha' : 'Your password'}
                      className="rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-2 py-2 text-sm text-[color:var(--text-main)] outline-none"
                    />
                    {authError ? <p className="text-xs text-[color:var(--text-muted)]">{authError}</p> : null}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isAuthBusy}
                        onClick={() => { void signInWithGoogle(language) }}
                        className="rounded-[10px] border border-[color:var(--card-border)] px-3 py-1.5 text-xs text-[color:var(--text-main)] disabled:opacity-60"
                      >
                        Google
                      </button>
                      <button
                        type="button"
                        disabled={isAuthBusy}
                        onClick={() => { void signInWithEmail(authEmail, authPassword, language) }}
                        className="rounded-[10px] border border-[color:var(--card-border)] px-3 py-1.5 text-xs text-[color:var(--text-main)] disabled:opacity-60"
                      >
                        {language === 'pt' ? 'Entrar' : 'Sign in'}
                      </button>
                      <button
                        type="button"
                        disabled={isAuthBusy}
                        onClick={() => { void signUpWithEmail(authEmail, authPassword, language) }}
                        className="rounded-[10px] border border-[color:var(--card-border)] px-3 py-1.5 text-xs text-[color:var(--text-main)] disabled:opacity-60"
                      >
                        {language === 'pt' ? 'Criar conta' : 'Create account'}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </>
          ) : null}
        </aside>
      </div>
    </section>
  )
}
