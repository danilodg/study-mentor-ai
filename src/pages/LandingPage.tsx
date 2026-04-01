import type { ComponentProps } from 'react'
import { LandingScreen } from '../components/LandingScreen'

type LandingPageProps = ComponentProps<typeof LandingScreen>

export function LandingPage(props: LandingPageProps) {
  return <LandingScreen {...props} />
}
