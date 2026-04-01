import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { Dispatch, SetStateAction } from 'react'
import { supabase } from '../lib/supabase'
import type { Conversation, Language, ResponseMode, StoredChatState } from '../types/chat'
import { parseStoredResponseMode } from '../utils/chat'

interface UseCloudSyncParams {
  sessionUserId?: string
  isCloudSyncEnabled: boolean
  userPlan: 'free' | 'pro'
  setUserPlan: (plan: 'free' | 'pro') => void
  setIsCloudSyncEnabled: (value: boolean | ((current: boolean) => boolean)) => void
  currentStoredState: StoredChatState
  hasLoadedCloudState: boolean
  setHasLoadedCloudState: Dispatch<SetStateAction<boolean>>
  setLastCloudSyncAt: Dispatch<SetStateAction<number | null>>
  setConversations: Dispatch<SetStateAction<Conversation[]>>
  setActiveConversationId: Dispatch<SetStateAction<string>>
  setLanguage: Dispatch<SetStateAction<Language>>
  setResponseMode: Dispatch<SetStateAction<ResponseMode>>
  debounceMs: number
}

export function useCloudSync({
  sessionUserId,
  isCloudSyncEnabled,
  userPlan,
  setUserPlan,
  setIsCloudSyncEnabled,
  currentStoredState,
  hasLoadedCloudState,
  setHasLoadedCloudState,
  setLastCloudSyncAt,
  setConversations,
  setActiveConversationId,
  setLanguage,
  setResponseMode,
  debounceMs,
}: UseCloudSyncParams) {
  const workspaceStateQuery = useQuery({
    queryKey: ['workspace-state', sessionUserId],
    enabled: Boolean(supabase && sessionUserId),
    queryFn: async () => {
      const { data, error } = await (supabase as NonNullable<typeof supabase>)
        .from('user_workspace_states')
        .select('state, plan_code')
        .eq('user_id', sessionUserId as string)
        .maybeSingle()

      if (error) {
        throw error
      }

      return {
        planCode: (data?.plan_code === 'pro' ? 'pro' : 'free') as 'pro' | 'free',
        state: (data?.state ?? null) as StoredChatState | null,
      }
    },
  })

  const cloudSaveMutation = useMutation({
    mutationFn: async (state: StoredChatState) => {
      if (!supabase || !sessionUserId) {
        return null
      }

      const { error } = await supabase
        .from('user_workspace_states')
        .upsert({
          user_id: sessionUserId,
          state,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })

      if (error) {
        throw error
      }

      return true
    },
  })

  useEffect(() => {
    if (!sessionUserId) {
      setHasLoadedCloudState(false)
      return
    }

    if (!workspaceStateQuery.data || hasLoadedCloudState) {
      return
    }

    const { planCode, state } = workspaceStateQuery.data

    setUserPlan(planCode)
    setIsCloudSyncEnabled(planCode === 'pro')

    if (planCode === 'pro' && state?.conversations?.length) {
      const nextConversations = state.conversations
      const nextActiveConversationId = nextConversations.some((conversation) => conversation.id === state.activeConversationId)
        ? state.activeConversationId
        : nextConversations[0].id

      setConversations(nextConversations)
      setActiveConversationId(nextActiveConversationId)
      setLanguage(state.language === 'en' ? 'en' : 'pt')
      setResponseMode(parseStoredResponseMode(state.responseMode))
    }

    setHasLoadedCloudState(true)
  }, [
    hasLoadedCloudState,
    sessionUserId,
    setActiveConversationId,
    setConversations,
    setHasLoadedCloudState,
    setIsCloudSyncEnabled,
    setLanguage,
    setResponseMode,
    setUserPlan,
    workspaceStateQuery.data,
  ])

  useEffect(() => {
    if (!sessionUserId || !hasLoadedCloudState || !isCloudSyncEnabled || userPlan !== 'pro') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      cloudSaveMutation.mutate(currentStoredState, {
        onSuccess: () => {
          setLastCloudSyncAt(Date.now())
        },
      })
    }, debounceMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    cloudSaveMutation,
    currentStoredState,
    debounceMs,
    hasLoadedCloudState,
    isCloudSyncEnabled,
    sessionUserId,
    setLastCloudSyncAt,
    userPlan,
  ])
}
