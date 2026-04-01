import { MoonStar, MoreHorizontal, PanelLeft, Plus, SunMedium } from 'lucide-react'
import { useChatWorkspaceContext } from '../../context/ChatWorkspaceContext'
import { getConversationDisplayTitle } from '../../utils/conversation'

export function DesktopSidebar() {
  const {
    language,
    theme,
    setTheme,
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
    responseModeOptions,
    responseMode,
    setResponseMode,
    responseModeLabel,
    userPlan,
    isCloudSyncEnabled,
    setIsCloudSyncEnabled,
    cloudSyncTimeText,
    sessionEmail,
    signOutFromCloud,
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
        <aside className="glass-panel app-scroll flex h-full flex-col overflow-y-auto rounded-[10px] p-2">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsDesktopSidebarPinned((current) => !current)}
              className={[
                'inline-flex h-11 items-center rounded-[10px] border border-[color:var(--card-border)] bg-transparent text-sm text-[color:var(--text-main)] transition hover:bg-[color:var(--input-bg)]',
                isDesktopSidebarOpen
                  ? 'w-full justify-start gap-2 px-3'
                  : 'w-full justify-start px-3',
              ].join(' ')}
              aria-label={language === 'pt' ? 'Alternar menu lateral' : 'Toggle sidebar'}
              title={language === 'pt' ? 'Fixar menu' : 'Pin sidebar'}
            >
              <PanelLeft size={17} className="shrink-0" />
              {isDesktopSidebarOpen ? <span>{language === 'pt' ? 'Menu' : 'Menu'}</span> : null}
            </button>

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
              <section className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-transparent p-2">
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

              <section className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-transparent p-2">
                <span className="section-label">{language === 'pt' ? 'Tipo de resposta' : 'Response type'}</span>
                <div className="mt-2 grid gap-2">
                  {responseModeOptions.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setResponseMode(mode)}
                      className={[
                        'rounded-[10px] border px-2 py-2 text-left text-sm transition hover:-translate-y-0.5',
                        responseMode === mode
                          ? 'border-[color:var(--accent-line)]/55 bg-[color:var(--input-bg)] text-[color:var(--text-main)]'
                          : 'border-[color:var(--card-border)] bg-transparent text-[color:var(--text-soft)]',
                      ].join(' ')}
                    >
                      {responseModeLabel[language][mode]}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-transparent p-2">
                <span className="section-label">{language === 'pt' ? 'Conta e nuvem' : 'Account & cloud'}</span>

                {sessionEmail ? (
                  <div className="mt-2 grid gap-2">
                    <p className="text-sm text-[color:var(--text-main)]">{sessionEmail}</p>
                    <p className="text-xs text-[color:var(--text-muted)]">
                      {userPlan === 'pro'
                        ? (isCloudSyncEnabled
                            ? (language === 'pt' ? 'Sincronizacao ativa' : 'Cloud sync enabled')
                            : (language === 'pt' ? 'Sincronizacao pausada' : 'Cloud sync paused'))
                        : (language === 'pt' ? 'Plano free: dados locais (sem nuvem)' : 'Free plan: local data only (no cloud sync)')}
                      {cloudSyncTimeText
                        ? ` • ${language === 'pt' ? 'Ultimo sync' : 'Last sync'}: ${cloudSyncTimeText}`
                        : ''}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={userPlan !== 'pro'}
                        onClick={() => setIsCloudSyncEnabled((current) => !current)}
                        className="rounded-[10px] border border-[color:var(--card-border)] px-3 py-1.5 text-xs text-[color:var(--text-main)] disabled:opacity-60"
                      >
                        {isCloudSyncEnabled
                          ? (language === 'pt' ? 'Pausar nuvem' : 'Pause cloud')
                          : (language === 'pt' ? 'Ativar nuvem' : 'Enable cloud')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { void signOutFromCloud() }}
                        className="rounded-[10px] border border-[color:var(--card-border)] px-3 py-1.5 text-xs text-[color:var(--text-main)]"
                      >
                        {language === 'pt' ? 'Sair' : 'Sign out'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 grid gap-2">
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

              <section className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-transparent p-2">
                <span className="section-label">{language === 'pt' ? 'Tema' : 'Theme'}</span>
                <button
                  type="button"
                  onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
                  className="mt-2 inline-flex w-full items-center justify-between rounded-[10px] border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)]"
                >
                  <span>{t.theme}</span>
                  <span className="inline-flex items-center gap-2">
                    {theme === 'dark' ? <SunMedium size={14} /> : <MoonStar size={14} />}
                    {theme === 'dark'
                      ? (language === 'pt' ? 'Claro' : 'Light')
                      : (language === 'pt' ? 'Escuro' : 'Dark')}
                  </span>
                </button>
              </section>
            </>
          ) : null}

          {!isDesktopSidebarOpen ? (
            <button
              type="button"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              className="mt-auto inline-flex h-11 w-full items-center justify-start rounded-[10px] border border-[color:var(--card-border)] bg-transparent px-3 text-[color:var(--text-main)] transition hover:-translate-y-0.5"
              aria-label={t.theme}
              title={t.theme}
            >
              {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
            </button>
          ) : null}
        </aside>
      </div>
    </section>
  )
}
