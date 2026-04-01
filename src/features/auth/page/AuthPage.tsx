import { useNavigate } from 'react-router-dom'
import { AuthScreen } from '../../../components/AuthScreen'
import { useAppContext } from '../../../context/AppContext'

export function AuthPage() {
  const navigate = useNavigate()
  const { app } = useAppContext()

  return (
    <AuthScreen
      language={app.language}
      isSupabaseConfigured={app.isSupabaseConfigured}
      authEmail={app.authEmail}
      authPassword={app.authPassword}
      authError={app.authError}
      isAuthBusy={app.isAuthBusy}
      onAuthEmailChange={app.setAuthEmail}
      onAuthPasswordChange={app.setAuthPassword}
      onSignInWithGoogle={() => { void app.signInWithGoogle(app.language) }}
      onSignInWithEmail={() => { void app.signInWithEmail(app.authEmail, app.authPassword, app.language) }}
      onSignUpWithEmail={() => { void app.signUpWithEmail(app.authEmail, app.authPassword, app.language) }}
      onBack={() => navigate('/')}
    />
  )
}
