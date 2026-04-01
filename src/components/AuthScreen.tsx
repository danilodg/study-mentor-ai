interface AuthScreenProps {
  language: 'pt' | 'en'
  isSupabaseConfigured: boolean
  authEmail: string
  authPassword: string
  authError: string
  isAuthBusy: boolean
  onAuthEmailChange: (value: string) => void
  onAuthPasswordChange: (value: string) => void
  onSignInWithGoogle: () => void
  onSignInWithEmail: () => void
  onSignUpWithEmail: () => void
  onBack: () => void
}

export function AuthScreen({
  language,
  isSupabaseConfigured,
  authEmail,
  authPassword,
  authError,
  isAuthBusy,
  onAuthEmailChange,
  onAuthPasswordChange,
  onSignInWithGoogle,
  onSignInWithEmail,
  onSignUpWithEmail,
  onBack,
}: AuthScreenProps) {
  return (
    <div className="flex min-h-[calc(100dvh-1rem)] items-center justify-center">
      <section className="mx-auto w-full max-w-lg glass-panel rounded-[28px] p-3 sm:p-4">
        <h2 className="font-['Space_Grotesk'] text-[1.5rem] font-bold text-[color:var(--text-main)]">
          {language === 'pt' ? 'Entrar na sua conta' : 'Sign in to your account'}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          {language === 'pt'
            ? 'Crie conta ou entre para liberar o chat. Plano free usa dados locais; plano pro ativa nuvem.'
            : 'Create an account or sign in to unlock chat. Free plan uses local data; pro enables cloud sync.'}
        </p>

        {!isSupabaseConfigured ? (
          <p className="mt-3 text-sm text-[color:var(--text-muted)]">
            {language === 'pt'
              ? 'Supabase ainda nao configurado neste ambiente. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'
              : 'Supabase is not configured in this environment. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'}
          </p>
        ) : (
          <div className="mt-3 grid gap-2">
            <input
              type="email"
              value={authEmail}
              onChange={(event) => onAuthEmailChange(event.target.value)}
              placeholder={language === 'pt' ? 'Seu email' : 'Your email'}
              className="rounded-[12px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-2 py-2 text-sm text-[color:var(--text-main)] outline-none"
            />
            <input
              type="password"
              value={authPassword}
              onChange={(event) => onAuthPasswordChange(event.target.value)}
              placeholder={language === 'pt' ? 'Sua senha' : 'Your password'}
              className="rounded-[12px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-2 py-2 text-sm text-[color:var(--text-main)] outline-none"
            />
            {authError ? <p className="text-xs text-[color:var(--text-muted)]">{authError}</p> : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isAuthBusy}
                onClick={onSignInWithGoogle}
                className="rounded-full border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)] disabled:opacity-60"
              >
                {language === 'pt' ? 'Entrar com Google' : 'Sign in with Google'}
              </button>
              <button
                type="button"
                disabled={isAuthBusy}
                onClick={onSignInWithEmail}
                className="accent-button rounded-full px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {language === 'pt' ? 'Entrar' : 'Sign in'}
              </button>
              <button
                type="button"
                disabled={isAuthBusy}
                onClick={onSignUpWithEmail}
                className="rounded-full border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)] disabled:opacity-60"
              >
                {language === 'pt' ? 'Criar conta' : 'Create account'}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="rounded-full border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)]"
              >
                {language === 'pt' ? 'Voltar' : 'Back'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
