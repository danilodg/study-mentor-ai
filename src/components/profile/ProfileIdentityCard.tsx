interface ProfileIdentityCardProps {
  language: 'pt' | 'en'
  primaryIdentity: string
  displayName?: string
  email?: string
  isLoggedIn: boolean
}

export function ProfileIdentityCard({
  language,
  primaryIdentity,
  displayName,
  email,
  isLoggedIn,
}: ProfileIdentityCardProps) {
  return (
    <>
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
    </>
  )
}
