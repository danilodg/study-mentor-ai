interface ProfileSettingsStepProps {
  language: 'pt' | 'en'
  theme: 'dark' | 'light'
  onSwitchLanguage: (nextLanguage: 'pt' | 'en') => void
  onToggleTheme: () => void
}

export function ProfileSettingsStep({
  language,
  theme,
  onSwitchLanguage,
  onToggleTheme,
}: ProfileSettingsStepProps) {
  return (
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
  )
}
