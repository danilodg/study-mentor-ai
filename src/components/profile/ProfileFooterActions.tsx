interface ProfileFooterActionsProps {
  language: 'pt' | 'en'
  isLoggedIn: boolean
  onSignOut: () => void
  onBackToChat: () => void
}

export function ProfileFooterActions({
  language,
  isLoggedIn,
  onSignOut,
  onBackToChat,
}: ProfileFooterActionsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
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
  )
}
