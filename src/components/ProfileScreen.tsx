import { useState } from 'react'
import type { ProfilePlansCopy } from '../content/copy'
import { ProfileAuthNotice } from './profile/ProfileAuthNotice'
import { ProfileFooterActions } from './profile/ProfileFooterActions'
import { ProfileIdentityCard } from './profile/ProfileIdentityCard'
import { ProfilePlanStep } from './profile/ProfilePlanStep'
import { ProfileSettingsStep } from './profile/ProfileSettingsStep'
import { ProfileStepTabs } from './profile/ProfileStepTabs'

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
  const [activeStep, setActiveStep] = useState<'settings' | 'plan'>('settings')

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

        <ProfileIdentityCard
          language={language}
          primaryIdentity={primaryIdentity}
          displayName={displayName}
          email={email}
          isLoggedIn={isLoggedIn}
        />

        {!isLoggedIn ? (
          <ProfileAuthNotice language={language} onGoToAuth={onGoToAuth} />
        ) : null}

        <ProfileStepTabs language={language} activeStep={activeStep} onChangeStep={setActiveStep} />

        {activeStep === 'settings' ? (
          <ProfileSettingsStep
            language={language}
            theme={theme}
            onSwitchLanguage={onSwitchLanguage}
            onToggleTheme={onToggleTheme}
          />
        ) : (
          <ProfilePlanStep
            language={language}
            isLoggedIn={isLoggedIn}
            userPlan={userPlan}
            plansCopy={plansCopy}
            isCloudSyncEnabled={isCloudSyncEnabled}
            onSelectPlan={onSelectPlan}
            onToggleCloudSync={onToggleCloudSync}
          />
        )}

        <ProfileFooterActions
          language={language}
          isLoggedIn={isLoggedIn}
          onSignOut={onSignOut}
          onBackToChat={onBackToChat}
        />
      </section>
    </div>
  )
}
