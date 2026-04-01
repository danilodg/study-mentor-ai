import { useNavigate } from 'react-router-dom'
import { ProfileScreen } from '../../../components/ProfileScreen'
import { useAppContext } from '../../../context/AppContext'

export function ProfilePage() {
  const navigate = useNavigate()
  const { app } = useAppContext()

  return (
    <ProfileScreen
      language={app.language}
      email={app.session?.user.email}
      userPlan={app.userPlan}
      isCloudSyncEnabled={app.isCloudSyncEnabled}
      onToggleCloudSync={() => app.setIsCloudSyncEnabled((current) => !current)}
      onSignOut={() => {
        void app.signOutFromCloud()
        navigate('/auth')
      }}
      onBackToChat={() => navigate('/chat')}
    />
  )
}
