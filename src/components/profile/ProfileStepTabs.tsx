interface ProfileStepTabsProps {
  language: 'pt' | 'en'
  activeStep: 'settings' | 'plan'
  onChangeStep: (nextStep: 'settings' | 'plan') => void
}

export function ProfileStepTabs({ language, activeStep, onChangeStep }: ProfileStepTabsProps) {
  return (
    <div className="mt-3 rounded-[10px] border border-[color:var(--card-border)] p-1">
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => onChangeStep('settings')}
          className={[
            'rounded-[8px] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition',
            activeStep === 'settings'
              ? 'bg-[color:var(--input-bg)] text-[color:var(--text-main)]'
              : 'text-[color:var(--text-soft)] hover:text-[color:var(--text-main)]',
          ].join(' ')}
        >
          {language === 'pt' ? 'Configuracoes' : 'Settings'}
        </button>
        <button
          type="button"
          onClick={() => onChangeStep('plan')}
          className={[
            'rounded-[8px] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition',
            activeStep === 'plan'
              ? 'bg-[color:var(--input-bg)] text-[color:var(--text-main)]'
              : 'text-[color:var(--text-soft)] hover:text-[color:var(--text-main)]',
          ].join(' ')}
        >
          {language === 'pt' ? 'Plano' : 'Plan'}
        </button>
      </div>
    </div>
  )
}
