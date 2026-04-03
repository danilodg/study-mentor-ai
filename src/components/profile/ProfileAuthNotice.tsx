interface ProfileAuthNoticeProps {
  language: 'pt' | 'en'
  onGoToAuth: () => void
}

export function ProfileAuthNotice({ language, onGoToAuth }: ProfileAuthNoticeProps) {
  return (
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
  )
}
