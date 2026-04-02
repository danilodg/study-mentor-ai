import type { ProfilePlansCopy } from '../content/copy'

interface ProfileScreenProps {
  language: 'pt' | 'en'
  theme: 'dark' | 'light'
  displayName?: string
  email?: string
  isLoggedIn: boolean
  userPlan: 'free' | 'pro'
  plansCopy: ProfilePlansCopy
  onSelectPlan: (plan: 'free' | 'pro') => void
  isCloudSyncEnabled: boolean
  onToggleCloudSync: () => void
  onSwitchLanguage: (nextLanguage: 'pt' | 'en') => void
  onToggleTheme: () => void
  onSignOut: () => void
  onBackToChat: () => void
  onGoToAuth: () => void
}

export function ProfileScreen({
  language,
  theme,
  displayName,
  email,
  isLoggedIn,
  userPlan,
  plansCopy,
  onSelectPlan,
  isCloudSyncEnabled,
  onToggleCloudSync,
  onSwitchLanguage,
  onToggleTheme,
  onSignOut,
  onBackToChat,
  onGoToAuth,
}: ProfileScreenProps) {
  const primaryIdentity = displayName || email || '-'

  return (
    <div className="flex min-h-[calc(100dvh-1rem)] items-center justify-center">
      <section className="mx-auto w-full max-w-xl glass-panel rounded-[10px] p-3 sm:p-4">
        <h2 className="font-['Space_Grotesk'] text-[1.5rem] font-bold text-[color:var(--text-main)]">
          {language === 'pt' ? 'Perfil da conta' : 'Account profile'}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          {language === 'pt'
            ? 'Gerencie seu plano e a sincronizacao de estudos.'
            : 'Manage your plan and study sync settings.'}
        </p>

        <div className="mt-3 flex items-center gap-3 rounded-[10px] border border-[color:var(--card-border)] p-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--card-border)] bg-[color:var(--input-bg)] text-sm font-semibold text-[color:var(--text-main)]">
            {(primaryIdentity[0] || '?').toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[color:var(--text-main)]">{primaryIdentity}</p>
            <p className="text-xs text-[color:var(--text-muted)]">
              {isLoggedIn
                ? (language === 'pt' ? 'Conta conectada' : 'Account connected')
                : (language === 'pt' ? 'Conta desconectada' : 'Account not connected')}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-[10px] border border-[color:var(--card-border)] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            {language === 'pt' ? 'Usuario' : 'User'}
          </p>
          <p className="mt-1 text-sm text-[color:var(--text-main)]">{primaryIdentity}</p>
          {displayName && email ? (
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">{email}</p>
          ) : null}
        </div>

        {!isLoggedIn ? (
          <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] p-3">
            <p className="text-sm text-[color:var(--text-main)]">
              {language === 'pt'
                ? 'Voce ainda nao entrou na conta.'
                : 'You are not signed in yet.'}
            </p>
            <button
              type="button"
              onClick={onGoToAuth}
              className="mt-3 accent-button rounded-full px-3 py-2 text-sm font-semibold text-white"
            >
              {language === 'pt' ? 'Entrar' : 'Sign in'}
            </button>
          </div>
        ) : null}

        <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            {plansCopy.sectionTitle}
          </p>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">
            {plansCopy.sectionDescription}
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {plansCopy.plans.map((plan) => (
              <button
                key={plan.code}
                type="button"
                disabled={!isLoggedIn}
                onClick={() => onSelectPlan(plan.code)}
                className={[
                  'rounded-[10px] border p-3 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60',
                  userPlan === plan.code
                    ? 'border-[color:var(--accent-line)] bg-[color:var(--input-bg)]'
                    : 'border-[color:var(--card-border)]',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[color:var(--text-main)]">{plan.title}</p>
                  <span className="text-xs font-semibold text-[color:var(--text-main)]">{plan.price}</span>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-[color:var(--text-muted)]">
                  {plan.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
                {userPlan === plan.code ? (
                  <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--accent-soft)]">
                    {plansCopy.currentPlanLabel}
                  </p>
                ) : null}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-[color:var(--text-muted)]">
            {userPlan === 'pro' ? plansCopy.proStatus : plansCopy.freeStatus}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={userPlan !== 'pro' || !isLoggedIn}
            onClick={onToggleCloudSync}
            className="rounded-full border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)] disabled:opacity-60"
          >
            {isCloudSyncEnabled
              ? (language === 'pt' ? 'Pausar nuvem' : 'Pause cloud')
              : (language === 'pt' ? 'Ativar nuvem' : 'Enable cloud')}
          </button>
          <button
            type="button"
            disabled={!isLoggedIn}
            onClick={onSignOut}
            className="rounded-full border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)] disabled:opacity-60"
          >
            {language === 'pt' ? 'Sair da conta' : 'Sign out'}
          </button>
          <button
            type="button"
            onClick={onBackToChat}
            className="accent-button rounded-full px-3 py-2 text-sm font-semibold text-white"
          >
            {language === 'pt' ? 'Voltar ao chat' : 'Back to chat'}
          </button>
        </div>

        <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            {language === 'pt' ? 'Configuracoes' : 'Settings'}
          </p>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-[10px] border border-[color:var(--card-border)] p-2">
              <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                {language === 'pt' ? 'Idioma' : 'Language'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(['pt', 'en'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSwitchLanguage(option)}
                    className={[
                      'rounded-[10px] border px-2 py-2 text-xs font-semibold uppercase tracking-[0.12em]',
                      language === option
                        ? 'border-[color:var(--accent-line)] bg-[color:var(--input-bg)] text-[color:var(--text-main)]'
                        : 'border-[color:var(--card-border)] text-[color:var(--text-soft)]',
                    ].join(' ')}
                  >
                    {option.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-[color:var(--card-border)] p-2">
              <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                {language === 'pt' ? 'Tema' : 'Theme'}
              </p>
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex w-full items-center justify-between rounded-[10px] border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)]"
              >
                <span>{language === 'pt' ? 'Alternar tema' : 'Toggle theme'}</span>
                <span className="text-xs uppercase tracking-[0.1em] text-[color:var(--text-muted)]">
                  {theme === 'dark'
                    ? (language === 'pt' ? 'Escuro' : 'Dark')
                    : (language === 'pt' ? 'Claro' : 'Light')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
