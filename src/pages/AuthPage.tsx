import type { ComponentProps } from 'react'
import { AuthScreen } from '../components/AuthScreen'

type AuthPageProps = ComponentProps<typeof AuthScreen>

export function AuthPage(props: AuthPageProps) {
  return <AuthScreen {...props} />
}
