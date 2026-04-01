import type { ComponentProps } from 'react'
import { ProfileScreen } from '../components/ProfileScreen'

type ProfilePageProps = ComponentProps<typeof ProfileScreen>

export function ProfilePage(props: ProfilePageProps) {
  return <ProfileScreen {...props} />
}
