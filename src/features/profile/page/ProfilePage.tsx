import { useNavigate } from 'react-router-dom'
import { getProfilePlansCopy } from '../../../content/copy'
import { ProfileScreen } from '../../../components/ProfileScreen'
import { useAppContext } from '../../../context/AppContext'
import { getSessionDisplayName } from '../../../utils/user'

export function ProfilePage() {
  const navigate = useNavigate()
  const { app } = useAppContext()
  const isLoggedIn = Boolean(app.session)

  return (
    <ProfileScreen
      language={app.language}
      displayName={getSessionDisplayName(app.session)}
      email={app.session?.user.email}
      isLoggedIn={isLoggedIn}
      userPlan={app.userPlan}
      plansCopy={getProfilePlansCopy(app.language)}
      onSelectPlan={(plan) => { void app.setPlanWithCloudSync(plan) }}
      isCloudSyncEnabled={app.isCloudSyncEnabled}
      onToggleCloudSync={() => app.setIsCloudSyncEnabled((current) => !current)}
      onSignOut={() => {
        void app.signOutFromCloud()
        navigate('/auth')
      }}
      onBackToChat={() => navigate('/chat')}
      onGoToAuth={() => navigate('/auth')}
    />
  )
}
