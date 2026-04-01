interface ProfileScreenProps {
  language: 'pt' | 'en'
  email?: string
  userPlan: 'free' | 'pro'
  isCloudSyncEnabled: boolean
  onToggleCloudSync: () => void
  onSignOut: () => void
  onBackToChat: () => void
}

export function ProfileScreen({
  language,
  email,
  userPlan,
  isCloudSyncEnabled,
  onToggleCloudSync,
  onSignOut,
  onBackToChat,
}: ProfileScreenProps) {
  return (
    <div className="flex min-h-[calc(100dvh-1rem)] items-center justify-center">
      <section className="mx-auto w-full max-w-xl glass-panel rounded-[28px] p-3 sm:p-4">
        <h2 className="font-['Space_Grotesk'] text-[1.5rem] font-bold text-[color:var(--text-main)]">
          {language === 'pt' ? 'Perfil da conta' : 'Account profile'}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          {language === 'pt'
            ? 'Gerencie seu plano e a sincronizacao de estudos.'
            : 'Manage your plan and study sync settings.'}
        </p>

        <div className="mt-3 rounded-[18px] border border-[color:var(--card-border)] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">Email</p>
          <p className="mt-1 text-sm text-[color:var(--text-main)]">{email ?? '-'}</p>
        </div>

        <div className="mt-2 rounded-[18px] border border-[color:var(--card-border)] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            {language === 'pt' ? 'Plano' : 'Plan'}
          </p>
          <p className="mt-1 text-sm text-[color:var(--text-main)]">
            {userPlan === 'pro' ? 'Pro' : 'Free'}
          </p>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">
            {userPlan === 'pro'
              ? (language === 'pt' ? 'Sincronizacao em nuvem liberada.' : 'Cloud sync is available.')
              : (language === 'pt' ? 'No plano free os dados ficam locais.' : 'On free plan, data remains local.')}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={userPlan !== 'pro'}
            onClick={onToggleCloudSync}
            className="rounded-full border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)] disabled:opacity-60"
          >
            {isCloudSyncEnabled
              ? (language === 'pt' ? 'Pausar nuvem' : 'Pause cloud')
              : (language === 'pt' ? 'Ativar nuvem' : 'Enable cloud')}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)]"
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
      </section>
    </div>
  )
}
