import type { ProfilePlansCopy } from '../../content/copy'

interface ProfilePlanStepProps {
  language: 'pt' | 'en'
  isLoggedIn: boolean
  userPlan: 'free' | 'pro'
  plansCopy: ProfilePlansCopy
  isCloudSyncEnabled: boolean
  onSelectPlan: (plan: 'free' | 'pro') => void
  onToggleCloudSync: () => void
}

export function ProfilePlanStep({
  language,
  isLoggedIn,
  userPlan,
  plansCopy,
  isCloudSyncEnabled,
  onSelectPlan,
  onToggleCloudSync,
}: ProfilePlanStepProps) {
  return (
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
                <li key={feature}>- {feature}</li>
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

      <button
        type="button"
        disabled={userPlan !== 'pro' || !isLoggedIn}
        onClick={onToggleCloudSync}
        className="mt-3 rounded-full border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)] disabled:opacity-60"
      >
        {isCloudSyncEnabled
          ? (language === 'pt' ? 'Pausar nuvem' : 'Pause cloud')
          : (language === 'pt' ? 'Ativar nuvem' : 'Enable cloud')}
      </button>
    </div>
  )
}
