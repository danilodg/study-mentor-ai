import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type PlanCode = 'free' | 'pro'

interface AuthContextValue {
  session: Session | null
  userPlan: PlanCode
  isCloudSyncEnabled: boolean
  setIsCloudSyncEnabled: (value: boolean | ((current: boolean) => boolean)) => void
  signInWithEmail: (email: string, password: string, language: 'pt' | 'en') => Promise<void>
  signUpWithEmail: (email: string, password: string, language: 'pt' | 'en') => Promise<void>
  signInWithGoogle: (language: 'pt' | 'en') => Promise<void>
  signOutFromCloud: () => Promise<void>
  authError: string
  isAuthBusy: boolean
  setAuthError: (message: string) => void
  setUserPlan: (plan: PlanCode) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [userPlan, setUserPlan] = useState<PlanCode>('free')
  const [isCloudSyncEnabled, setIsCloudSyncEnabled] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isAuthBusy, setIsAuthBusy] = useState(false)

  useEffect(() => {
    if (!supabase) {
      return
    }

    let isMounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return
      }

      setSession(data.session ?? null)
      setIsCloudSyncEnabled(Boolean(data.session))

      if (!data.session) {
        setUserPlan('free')
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsCloudSyncEnabled(false)
      setAuthError('')

      if (!nextSession) {
        setUserPlan('free')
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  async function signInWithEmail(email: string, password: string, language: 'pt' | 'en') {
    if (!supabase) {
      setAuthError(language === 'pt' ? 'Supabase nao configurado no ambiente.' : 'Supabase is not configured in this environment.')
      return
    }

    if (!email.trim() || !password.trim()) {
      setAuthError(language === 'pt' ? 'Informe email e senha.' : 'Please provide email and password.')
      return
    }

    setIsAuthBusy(true)
    setAuthError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setAuthError(error.message)
    }

    setIsAuthBusy(false)
  }

  async function signUpWithEmail(email: string, password: string, language: 'pt' | 'en') {
    if (!supabase) {
      setAuthError(language === 'pt' ? 'Supabase nao configurado no ambiente.' : 'Supabase is not configured in this environment.')
      return
    }

    if (!email.trim() || !password.trim()) {
      setAuthError(language === 'pt' ? 'Informe email e senha.' : 'Please provide email and password.')
      return
    }

    setIsAuthBusy(true)
    setAuthError('')

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (error) {
      setAuthError(error.message)
    } else {
      setAuthError(language === 'pt' ? 'Conta criada. Se necessario, confirme seu email.' : 'Account created. Confirm your email if required.')
    }

    setIsAuthBusy(false)
  }

  async function signInWithGoogle(language: 'pt' | 'en') {
    if (!supabase) {
      setAuthError(language === 'pt' ? 'Supabase nao configurado no ambiente.' : 'Supabase is not configured in this environment.')
      return
    }

    setIsAuthBusy(true)
    setAuthError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      setAuthError(error.message)
      setIsAuthBusy(false)
    }
  }

  async function signOutFromCloud() {
    if (!supabase) {
      return
    }

    await supabase.auth.signOut()
  }

  const value = useMemo<AuthContextValue>(() => ({
    session,
    userPlan,
    isCloudSyncEnabled,
    setIsCloudSyncEnabled,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOutFromCloud,
    authError,
    isAuthBusy,
    setAuthError,
    setUserPlan,
  }), [authError, isAuthBusy, isCloudSyncEnabled, session, userPlan])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

export { isSupabaseConfigured }
