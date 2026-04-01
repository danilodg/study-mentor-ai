import { PanelLeft } from 'lucide-react'
import type { ResponseMode } from '../../types/chat'

interface DesktopSidebarProps {
  language: 'pt' | 'en'
  isDesktopSidebarOpen: boolean
  setIsDesktopSidebarPinned: (updater: (current: boolean) => boolean) => void
  setIsDesktopSidebarHovered: (value: boolean) => void
  openNewConversationModal: () => void
  isLoading: boolean
  conversationList: Array<{ id: string; title: string }>
  activeConversationId: string
  setActiveConversationId: (id: string) => void
  responseModeOptions: ResponseMode[]
  responseMode: ResponseMode
  setResponseMode: (mode: ResponseMode) => void
  responseModeLabel: Record<'pt' | 'en', Record<ResponseMode, string>>
  newChatLabel: string
  userPlan: 'free' | 'pro'
  isCloudSyncEnabled: boolean
  setIsCloudSyncEnabled: (updater: (current: boolean) => boolean) => void
  cloudSyncTimeText: string
  sessionEmail?: string
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

export function DesktopSidebar(props: DesktopSidebarProps) {
  const {
    language,
    isDesktopSidebarOpen,
    setIsDesktopSidebarPinned,
    setIsDesktopSidebarHovered,
    openNewConversationModal,
    isLoading,
    conversationList,
    activeConversationId,
    setActiveConversationId,
    responseModeOptions,
    responseMode,
    setResponseMode,
    responseModeLabel,
    newChatLabel,
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
  } = props

  return (
    <section className="relative hidden min-h-0 lg:order-1 lg:block">
      <div
        className="relative h-full"
        onMouseEnter={() => setIsDesktopSidebarHovered(true)}
        onMouseLeave={() => setIsDesktopSidebarHovered(false)}
      >
        <aside className="glass-panel flex h-full w-[88px] flex-col items-center rounded-[24px] px-2 py-3">
          <button
            type="button"
            onClick={() => setIsDesktopSidebarPinned((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[color:var(--card-border)] bg-transparent text-[color:var(--text-main)] transition hover:-translate-y-0.5"
            aria-label={language === 'pt' ? 'Alternar menu lateral' : 'Toggle sidebar'}
          >
            <PanelLeft size={17} />
          </button>

          <button
            type="button"
            onClick={openNewConversationModal}
            disabled={isLoading}
            className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[color:var(--card-border)] bg-transparent font-['IBM_Plex_Mono'] text-lg text-[color:var(--text-main)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label={language === 'pt' ? 'Nova conversa' : 'New chat'}
          >
            +
          </button>

          <div className="mt-3 h-px w-10 bg-[color:var(--card-border)]" />

          <span className="mt-2 font-['IBM_Plex_Mono'] text-[0.62rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            {language === 'pt' ? 'Menu' : 'Menu'}
          </span>
        </aside>

        <aside
          className={[
            'glass-panel app-scroll absolute left-[96px] top-0 z-20 h-full w-[320px] overflow-y-auto rounded-[24px] p-3 transition-all duration-200',
            isDesktopSidebarOpen ? 'pointer-events-auto translate-x-0 opacity-100' : 'pointer-events-none -translate-x-2 opacity-0',
          ].join(' ')}
        >
          <section className="rounded-[20px] border border-[color:var(--card-border)] bg-transparent p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="section-label">{language === 'pt' ? 'Conversas' : 'Conversations'}</span>
              <button
                type="button"
                onClick={openNewConversationModal}
                disabled={isLoading}
                className="inline-flex items-center rounded-full border border-[color:var(--card-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {newChatLabel}
              </button>
            </div>

            <div className="mt-3 grid min-w-0 gap-2">
              {conversationList.length > 0 ? conversationList.map((conversation, index) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={[
                    'glass-card w-full min-w-0 rounded-[18px] p-2 text-left',
                    conversation.id === activeConversationId ? 'border-[color:var(--accent-line)]/45' : '',
                  ].join(' ')}
                >
                  <p className="text-sm font-medium break-words text-[color:var(--text-main)]">
                    {conversation.title || `${newChatLabel} ${conversationList.length - index}`}
                  </p>
                </button>
              )) : (
                <article className="glass-card rounded-[18px] p-2 text-sm leading-6 text-[color:var(--text-muted)]">
                  {language === 'pt'
                    ? 'As conversas vao aparecer aqui conforme voce usa o chat.'
                    : 'Conversations appear here as you keep using the chat.'}
                </article>
              )}
            </div>
          </section>

          <section className="mt-2 rounded-[20px] border border-[color:var(--card-border)] bg-transparent p-2">
            <span className="section-label">{language === 'pt' ? 'Tipo de resposta' : 'Response type'}</span>
            <div className="mt-2 grid gap-2">
              {responseModeOptions.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setResponseMode(mode)}
                  className={[
                    'rounded-[14px] border px-2 py-2 text-left text-sm transition hover:-translate-y-0.5',
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

          <section className="mt-2 rounded-[20px] border border-[color:var(--card-border)] bg-transparent p-2">
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
                    className="rounded-full border border-[color:var(--card-border)] px-3 py-1.5 text-xs text-[color:var(--text-main)] disabled:opacity-60"
                  >
                    {isCloudSyncEnabled
                      ? (language === 'pt' ? 'Pausar nuvem' : 'Pause cloud')
                      : (language === 'pt' ? 'Ativar nuvem' : 'Enable cloud')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { void signOutFromCloud() }}
                    className="rounded-full border border-[color:var(--card-border)] px-3 py-1.5 text-xs text-[color:var(--text-main)]"
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
                  className="rounded-[12px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-2 py-2 text-sm text-[color:var(--text-main)] outline-none"
                />
                <input
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  placeholder={language === 'pt' ? 'Sua senha' : 'Your password'}
                  className="rounded-[12px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-2 py-2 text-sm text-[color:var(--text-main)] outline-none"
                />
                {authError ? <p className="text-xs text-[color:var(--text-muted)]">{authError}</p> : null}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isAuthBusy}
                    onClick={() => { void signInWithGoogle(language) }}
                    className="rounded-full border border-[color:var(--card-border)] px-3 py-1.5 text-xs text-[color:var(--text-main)] disabled:opacity-60"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    disabled={isAuthBusy}
                    onClick={() => { void signInWithEmail(authEmail, authPassword, language) }}
                    className="rounded-full border border-[color:var(--card-border)] px-3 py-1.5 text-xs text-[color:var(--text-main)] disabled:opacity-60"
                  >
                    {language === 'pt' ? 'Entrar' : 'Sign in'}
                  </button>
                  <button
                    type="button"
                    disabled={isAuthBusy}
                    onClick={() => { void signUpWithEmail(authEmail, authPassword, language) }}
                    className="rounded-full border border-[color:var(--card-border)] px-3 py-1.5 text-xs text-[color:var(--text-main)] disabled:opacity-60"
                  >
                    {language === 'pt' ? 'Criar conta' : 'Create account'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </section>
  )
}
