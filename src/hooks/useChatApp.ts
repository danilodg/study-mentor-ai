import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  copy,
  examProfileLabel,
  getAiUnavailableMessage,
  getExamCompletionText,
  getExamFallbackText,
  getExamProfileInstruction,
  getLocale,
  getMissingApiKeyMessage,
  getPassageExtraInstruction,
  getPassagePrompt,
  getPendingExamText,
  getQuestionExtraInstruction,
  getQuestionHistoryInstruction,
  getQuestionPrompt,
  getResponseModeInstruction,
  getTopicInstruction,
  systemInstructionByLanguage,
} from '../content/copy'
import { isSupabaseConfigured, useAuth } from '../context/AuthContext'
import { useChatDerived } from './useChatDerived'
import { useCloudSync } from './useCloudSync'
import { supabase } from '../lib/supabase'
import type {
  AssistantReplyPayload,
  Conversation,
  ConversationMode,
  DifficultyLevel,
  ExamFlow,
  ExamProfile,
  ForcedResponseMode,
  GeminiErrorResponse,
  GeminiResponse,
  Language,
  Message,
  QuizOptionId,
  ResponseMode,
  StoredChatState,
  Theme,
} from '../types/chat'
import {
  createConversation,
  getConversationTitle,
  getQuestionOnlyHistory,
  getStoredChatState,
  parseAssistantReply,
  parseRetryDelayMs,
} from '../utils/chat'

const googleAiApiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY?.trim()
const chatStorageKey = 'study-mentor-ai-chat'
const cloudSyncDebounceMs = 1300
const googleAiApiUrl = googleAiApiKey
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleAiApiKey}`
  : ''

export function useChatApp() {
  const storedChatState = getStoredChatState(chatStorageKey)
  const initialConversations = storedChatState?.conversations?.length
    ? storedChatState.conversations
    : [createConversation()]

  const [theme, setTheme] = useState<Theme>('dark')
  const [language, setLanguage] = useState<Language>(storedChatState?.language ?? 'pt')
  const [responseMode, setResponseMode] = useState<ResponseMode>(storedChatState?.responseMode ?? 'auto')
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false)
  const [newConversationMode, setNewConversationMode] = useState<ConversationMode>('chat')
  const [newConversationExamProfile, setNewConversationExamProfile] = useState<ExamProfile>('general')
  const [newConversationExamFlow, setNewConversationExamFlow] = useState<ExamFlow>('single')
  const [newConversationTopic, setNewConversationTopic] = useState('')
  const [newConversationDifficulty, setNewConversationDifficulty] = useState<DifficultyLevel>('auto')
  const [isMobileConversationMenuOpen, setIsMobileConversationMenuOpen] = useState(false)
  const [isDesktopSidebarPinned, setIsDesktopSidebarPinned] = useState(false)
  const [isDesktopSidebarHovered, setIsDesktopSidebarHovered] = useState(false)
  const [draft, setDraft] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<string>(storedChatState?.activeConversationId ?? initialConversations[0].id)
  const [isLoading, setIsLoading] = useState(false)
  const {
    session,
    userPlan,
    setUserPlan,
    isCloudSyncEnabled,
    setIsCloudSyncEnabled,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOutFromCloud,
    authError,
    isAuthBusy,
    setAuthError,
  } = useAuth()
  const [hasLoadedCloudState, setHasLoadedCloudState] = useState(false)
  const [lastCloudSyncAt, setLastCloudSyncAt] = useState<number | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [nowMs, setNowMs] = useState(() => Date.now())
  const draftTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const examGenerationRequestsRef = useRef<Set<string>>(new Set())
  const examBlockedUntilRef = useRef<Map<string, number>>(new Map())

  const t = copy[language]
  const { conversationList, activeConversation } = useChatDerived(conversations, activeConversationId)
  const messages = activeConversation?.messages ?? []
  const visibleMessages = messages.filter((message) => {
    if (message.isExamPassage) {
      return false
    }

    if (
      activeConversation?.mode === 'exam'
      && activeConversation.examFlow === 'passage'
      && message.role === 'assistant'
      && /^Texto-base para as proximas questoes:|^Base passage for the next questions:/i.test(message.text.trim())
    ) {
      return false
    }

    return true
  })
  const isDesktopSidebarOpen = isDesktopSidebarPinned || isDesktopSidebarHovered
  const hasPendingExamMessage = activeConversation?.mode === 'exam'
    && messages.some((message) => message.id.startsWith('pending-'))
  const showStickyPassagePanel = Boolean(
    activeConversation
      && activeConversation.mode === 'exam'
      && activeConversation.examFlow === 'passage'
      && activeConversation.examPassage.trim(),
  )
  const cloudSyncTimeText = lastCloudSyncAt
    ? new Date(lastCloudSyncAt).toLocaleTimeString(getLocale(language), { hour: '2-digit', minute: '2-digit' })
    : ''
  const currentStoredState: StoredChatState = {
    conversations,
    activeConversationId,
    language,
    responseMode,
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      chatStorageKey,
      JSON.stringify(currentStoredState),
    )
  }, [currentStoredState])

  useCloudSync({
    sessionUserId: session?.user.id,
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
    debounceMs: cloudSyncDebounceMs,
  })

  useEffect(() => {
    if (!activeConversation || isLoading) {
      return
    }

    const pendingMessage = activeConversation.messages[0]

    if (
      activeConversation.mode === 'exam'
      && activeConversation.questionCount === 0
      && pendingMessage
      && pendingMessage.id.startsWith('pending-')
    ) {
      void generateExamQuestion(activeConversation.id, 1, pendingMessage.id)
    }
  }, [activeConversation, isLoading])

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [])

  function resizeDraftTextarea(element: HTMLTextAreaElement) {
    element.style.height = 'auto'

    const computed = window.getComputedStyle(element)
    const lineHeight = Number.parseFloat(computed.lineHeight) || 24
    const paddingTop = Number.parseFloat(computed.paddingTop) || 0
    const paddingBottom = Number.parseFloat(computed.paddingBottom) || 0
    const maxHeight = (lineHeight * 3) + paddingTop + paddingBottom
    const nextHeight = Math.min(element.scrollHeight, maxHeight)

    element.style.height = `${nextHeight}px`
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }

  useEffect(() => {
    if (draftTextareaRef.current) {
      resizeDraftTextarea(draftTextareaRef.current)
    }
  }, [draft])

  function getAssistantReply(text: string) {
    const normalized = text.toLowerCase()

    if (normalized.includes('ia') || normalized.includes('ai') || normalized.includes('artificial')) {
      return t.responses.ai
    }
    if (normalized.includes('pesquisa') || normalized.includes('research')) {
      return t.responses.research
    }
    if (normalized.includes('tarefa') || normalized.includes('task') || normalized.includes('plano')) {
      return t.responses.task
    }
    if (normalized.includes('prompt')) {
      return t.responses.prompt
    }

    return t.responses.default
  }

  async function getGoogleAiReply(
    text: string,
    options?: {
      forcedMode?: ForcedResponseMode
      extraInstruction?: string
    },
  ): Promise<AssistantReplyPayload> {
    if (!googleAiApiUrl) {
      return {
        responseType: 'text',
        text: getMissingApiKeyMessage(language),
      }
    }

    const response = await fetch(googleAiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: [
              systemInstructionByLanguage[language],
              getResponseModeInstruction(language, options?.forcedMode ?? responseMode),
              options?.extraInstruction ?? '',
            ].filter(Boolean).join(' '),
          }],
        },
        generationConfig: {
          responseMimeType: 'application/json',
        },
        contents: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as GeminiErrorResponse | null
      throw new Error(errorData?.error?.message ?? `Google AI request failed with status ${response.status}`)
    }

    const data = (await response.json()) as GeminiResponse
    const reply = data.candidates?.[0]?.content?.parts?.map((part) => part.text?.trim()).filter(Boolean).join('\n\n')

    if (!reply) {
      throw new Error('Google AI returned an empty response')
    }

    return parseAssistantReply(reply)
  }

  async function submitMessage(text: string) {
    const value = text.trim()

    if (!value || isLoading || !activeConversation) {
      return
    }

    const conversationId = activeConversation.id
    const nextUserMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: value,
    }

    setConversations((current) => current.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation
      }

      return {
        ...conversation,
        messages: [...conversation.messages, nextUserMessage],
        title: conversation.title || getConversationTitle(value),
        updatedAt: Date.now(),
      }
    }))
    setDraft('')

    if (activeConversation.mode === 'exam') {
      if (
        activeConversation.examFlow === 'passage'
        && activeConversation.examQuestionTarget > 0
        && activeConversation.questionCount >= activeConversation.examQuestionTarget
      ) {
        setConversations((current) => current.map((conversation) => {
          if (conversation.id !== conversationId) {
            return conversation
          }

          return {
            ...conversation,
            questionCount: 0,
            updatedAt: Date.now(),
          }
        }))

        void generateExamQuestion(conversationId, 1, undefined, true)
        return
      }

      void generateExamQuestion(conversationId, activeConversation.questionCount + 1)
      return
    }

    try {
      setIsLoading(true)

      const assistantReply: AssistantReplyPayload = googleAiApiKey
        ? await getGoogleAiReply(value)
        : { responseType: 'text', text: getAssistantReply(value) }

      setConversations((current) => current.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation
        }

        return {
          ...conversation,
          messages: [
            ...conversation.messages,
            {
              id: `a-${Date.now() + 1}`,
              role: 'assistant',
              text: assistantReply.text,
              responseType: assistantReply.responseType,
              quiz: assistantReply.quiz,
              trueFalse: assistantReply.trueFalse,
              shortAnswer: assistantReply.shortAnswer,
            },
          ],
          updatedAt: Date.now(),
        }
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ''
      const retryDelayMs = parseRetryDelayMs(errorMessage)
      const retryAt = retryDelayMs > 0 ? Date.now() + retryDelayMs : undefined
      const isRateLimitError = /quota exceeded|resource_exhausted|rate limit|too many requests/i.test(errorMessage)
      const waitSeconds = retryDelayMs > 0 ? Math.ceil(retryDelayMs / 1000) : 0

      setConversations((current) => current.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation
        }

        return {
          ...conversation,
          messages: [
            ...conversation.messages,
            {
              id: `a-${Date.now() + 1}`,
              role: 'assistant',
              responseType: 'text',
              text: getAiUnavailableMessage(language, waitSeconds, isRateLimitError),
              retryAction: 'chat',
              retrySourceText: value,
              retryAt,
            },
          ],
          updatedAt: Date.now(),
        }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  async function retryAssistantMessage(message: Message) {
    if (!activeConversation || isLoading || message.role !== 'assistant' || !message.retryAction) {
      return
    }

    const remainingMs = (message.retryAt ?? 0) - Date.now()

    if (remainingMs > 0) {
      return
    }

    if (message.retryAction === 'exam') {
      await generateExamQuestion(
        activeConversation.id,
        message.retryQuestionNumber ?? (activeConversation.questionCount + 1),
        message.id,
      )
      return
    }

    const retryText = message.retrySourceText?.trim()

    if (!retryText) {
      return
    }

    try {
      setIsLoading(true)

      const assistantReply: AssistantReplyPayload = googleAiApiKey
        ? await getGoogleAiReply(retryText)
        : { responseType: 'text', text: getAssistantReply(retryText) }

      setConversations((current) => current.map((conversation) => {
        if (conversation.id !== activeConversation.id) {
          return conversation
        }

        return {
          ...conversation,
          messages: conversation.messages.map((currentMessage) => {
            if (currentMessage.id !== message.id) {
              return currentMessage
            }

            return {
              id: currentMessage.id,
              role: 'assistant',
              text: assistantReply.text,
              responseType: assistantReply.responseType,
              quiz: assistantReply.quiz,
              trueFalse: assistantReply.trueFalse,
              shortAnswer: assistantReply.shortAnswer,
            }
          }),
          updatedAt: Date.now(),
        }
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ''
      const retryDelayMs = parseRetryDelayMs(errorMessage)
      const waitSeconds = retryDelayMs > 0 ? Math.ceil(retryDelayMs / 1000) : 0
      const retryAt = retryDelayMs > 0 ? Date.now() + retryDelayMs : undefined
      const isRateLimitError = /quota exceeded|resource_exhausted|rate limit|too many requests/i.test(errorMessage)

      setConversations((current) => current.map((conversation) => {
        if (conversation.id !== activeConversation.id) {
          return conversation
        }

        return {
          ...conversation,
          messages: conversation.messages.map((currentMessage) => {
            if (currentMessage.id !== message.id) {
              return currentMessage
            }

            return {
              ...currentMessage,
              responseType: 'text',
              text: getAiUnavailableMessage(language, waitSeconds, isRateLimitError),
              retryAction: 'chat',
              retrySourceText: retryText,
              retryAt,
            }
          }),
          updatedAt: Date.now(),
        }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitMessage(draft)
  }

  function switchLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage)
    setDraft('')
  }

  function openNewConversationModal() {
    setIsNewConversationModalOpen(true)
  }

  function closeNewConversationModal() {
    setIsNewConversationModalOpen(false)
  }

  async function generateExamQuestion(
    conversationId: string,
    nextQuestionNumber: number,
    replaceMessageId?: string,
    forceNewPassage = false,
  ) {
    const blockedUntil = examBlockedUntilRef.current.get(conversationId) ?? 0

    if (Date.now() < blockedUntil) {
      return
    }

    const requestKey = `${conversationId}:${nextQuestionNumber}`

    if (examGenerationRequestsRef.current.has(requestKey)) {
      return
    }

    const targetConversation = conversations.find((conversation) => conversation.id === conversationId)

    if (!targetConversation) {
      return
    }

    const maxQuestions = targetConversation.examQuestionTarget > 0
      ? targetConversation.examQuestionTarget
      : 0

    if (maxQuestions > 0 && nextQuestionNumber > maxQuestions) {
      const completionText = getExamCompletionText(language)

      setConversations((current) => current.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation
        }

        const alreadyHasRecentCompletion = conversation.messages
          .slice(-6)
          .some((message) => message.role === 'assistant' && message.text === completionText)

        if (alreadyHasRecentCompletion) {
          return conversation
        }

        return {
          ...conversation,
          messages: [
            ...conversation.messages,
            {
              id: `a-${Date.now()}-set-complete`,
              role: 'assistant',
              responseType: 'text',
              text: completionText,
            },
          ],
          updatedAt: Date.now(),
        }
      }))

      return
    }

    const recentQuestionHistory = getQuestionOnlyHistory(targetConversation)
    const historyInstruction = getQuestionHistoryInstruction(language, recentQuestionHistory)

    examGenerationRequestsRef.current.add(requestKey)

    try {
      setIsLoading(true)

      const profileInstruction = getExamProfileInstruction(language, targetConversation.examProfile)
      const topicInstruction = getTopicInstruction(language, targetConversation.topic)

      let generatedPassageText = forceNewPassage ? '' : targetConversation.examPassage.trim()

      if (targetConversation.examFlow === 'passage' && !generatedPassageText) {
        const passageReply = await getGoogleAiReply(
          getPassagePrompt(language),
          {
            forcedMode: 'text',
            extraInstruction: getPassageExtraInstruction(
              language,
              profileInstruction,
              topicInstruction,
              targetConversation.difficulty,
            ),
          },
        )

        generatedPassageText = passageReply.text.trim()
      }

      const questionPayload = await getGoogleAiReply(
        getQuestionPrompt(language, nextQuestionNumber, targetConversation.examFlow, generatedPassageText),
        {
          forcedMode: 'auto',
          extraInstruction: getQuestionExtraInstruction(
            language,
            profileInstruction,
            topicInstruction,
            targetConversation.difficulty,
            targetConversation.examFlow,
            nextQuestionNumber,
            maxQuestions,
            historyInstruction,
          ),
        },
      )

      setConversations((current) => current.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation
        }

        const nextAssistantMessage: Message = {
          id: replaceMessageId ?? `a-${Date.now()}-${nextQuestionNumber}`,
          role: 'assistant',
          text: questionPayload.text,
          responseType: questionPayload.responseType,
          quiz: questionPayload.quiz,
          trueFalse: questionPayload.trueFalse,
          shortAnswer: questionPayload.shortAnswer,
        }

        const nextMessages = replaceMessageId
          ? conversation.messages.map((message) => (message.id === replaceMessageId ? nextAssistantMessage : message))
          : [...conversation.messages, nextAssistantMessage]

        return {
          ...conversation,
          messages: nextMessages,
          examPassage: generatedPassageText || conversation.examPassage,
          questionCount: nextQuestionNumber,
          updatedAt: Date.now(),
        }
      }))
    } catch (error) {
      examGenerationRequestsRef.current.delete(requestKey)

      const errorMessage = error instanceof Error ? error.message : ''
      const retryDelayMs = parseRetryDelayMs(errorMessage)
      const isQuotaError = /quota exceeded|resource_exhausted/i.test(errorMessage)

      if (retryDelayMs > 0) {
        examBlockedUntilRef.current.set(conversationId, Date.now() + retryDelayMs)
      }

      setConversations((current) => current.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation
        }

        const waitSeconds = retryDelayMs > 0 ? Math.ceil(retryDelayMs / 1000) : 0
        const fallbackText = getExamFallbackText(language, isQuotaError, waitSeconds)

        const fallbackMessage: Message = {
          id: replaceMessageId ?? `a-${Date.now()}-fallback`,
          role: 'assistant',
          responseType: 'text',
          text: fallbackText,
          retryAction: 'exam',
          retryQuestionNumber: nextQuestionNumber,
          retryAt: retryDelayMs > 0 ? Date.now() + retryDelayMs : undefined,
        }

        if (replaceMessageId) {
          return {
            ...conversation,
            messages: conversation.messages.map((message) => (message.id === replaceMessageId ? fallbackMessage : message)),
            updatedAt: Date.now(),
          }
        }

        const lastMessage = conversation.messages[conversation.messages.length - 1]

        if (lastMessage?.role === 'assistant' && lastMessage.text === fallbackText) {
          return conversation
        }

        return {
          ...conversation,
          messages: [...conversation.messages, fallbackMessage],
          updatedAt: Date.now(),
        }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  async function startNewConversation() {
    if (isSupabaseConfigured && !session) {
      setIsNewConversationModalOpen(false)
      return 'auth_required' as const
    }

    const trimmedTopic = newConversationTopic.trim()
    const shouldUseExamMode = newConversationMode === 'exam'
    const questionTarget = shouldUseExamMode && newConversationExamFlow === 'passage' ? 4 : 0
    const examTitle = trimmedTopic || examProfileLabel[language][newConversationExamProfile]

    const pendingQuestionMessageId = `pending-${Date.now()}`

    const nextConversation = createConversation({
      mode: shouldUseExamMode ? 'exam' : 'chat',
      topic: shouldUseExamMode ? trimmedTopic : '',
      difficulty: shouldUseExamMode ? newConversationDifficulty : 'auto',
      examProfile: shouldUseExamMode ? newConversationExamProfile : 'general',
      examFlow: shouldUseExamMode ? newConversationExamFlow : 'single',
      examQuestionTarget: shouldUseExamMode ? questionTarget : 0,
      title: shouldUseExamMode
        ? getConversationTitle(examTitle)
        : '',
    })

    const nextConversationWithInitialMessage: Conversation = shouldUseExamMode
      ? {
        ...nextConversation,
        messages: [
          {
            id: pendingQuestionMessageId,
            role: 'assistant',
            responseType: 'text',
            text: getPendingExamText(language, newConversationExamFlow),
          },
        ],
      }
      : nextConversation

    setConversations((current) => [nextConversationWithInitialMessage, ...current])
    setActiveConversationId(nextConversationWithInitialMessage.id)
    setDraft('')
    setIsNewConversationModalOpen(false)
    setNewConversationTopic('')
    setNewConversationMode('chat')
    setNewConversationExamProfile('general')
    setNewConversationExamFlow('single')
    setNewConversationDifficulty('auto')

    return 'created' as const
  }

  function selectQuizOption(messageId: string, optionId: QuizOptionId) {
    if (!activeConversation || isLoading) {
      return
    }

    const targetMessage = activeConversation.messages.find((message) => message.id === messageId)

    if (!targetMessage?.quiz || targetMessage.selectedOptionId) {
      return
    }

    setConversations((current) => current.map((conversation) => {
      if (conversation.id !== activeConversationId) {
        return conversation
      }

      return {
        ...conversation,
        messages: conversation.messages.map((message) => {
          if (message.id !== messageId || !message.quiz || message.selectedOptionId) {
            return message
          }

          return {
            ...message,
            selectedOptionId: optionId,
          }
        }),
        updatedAt: Date.now(),
      }
    }))

    if (activeConversation.mode === 'exam') {
      void generateExamQuestion(activeConversation.id, activeConversation.questionCount + 1)
    }
  }

  function selectTrueFalseOption(messageId: string, answer: boolean) {
    if (!activeConversation || isLoading) {
      return
    }

    const targetMessage = activeConversation.messages.find((message) => message.id === messageId)

    if (!targetMessage?.trueFalse || typeof targetMessage.selectedTrueFalse === 'boolean') {
      return
    }

    setConversations((current) => current.map((conversation) => {
      if (conversation.id !== activeConversationId) {
        return conversation
      }

      return {
        ...conversation,
        messages: conversation.messages.map((message) => {
          if (message.id !== messageId || !message.trueFalse || typeof message.selectedTrueFalse === 'boolean') {
            return message
          }

          return {
            ...message,
            selectedTrueFalse: answer,
          }
        }),
        updatedAt: Date.now(),
      }
    }))

    if (activeConversation.mode === 'exam') {
      void generateExamQuestion(activeConversation.id, activeConversation.questionCount + 1)
    }
  }

  function deleteConversation(conversationId: string) {
    setConversations((current) => {
      const remaining = current.filter((conversation) => conversation.id !== conversationId)

      if (remaining.length === 0) {
        const freshConversation = createConversation()
        setActiveConversationId(freshConversation.id)
        return [freshConversation]
      }

      if (activeConversationId === conversationId) {
        setActiveConversationId(remaining[0].id)
      }

      return remaining
    })
  }

  async function setPlanWithCloudSync(plan: 'free' | 'pro') {
    setUserPlan(plan)

    const shouldEnableCloudSync = plan === 'pro' && Boolean(session)
    setIsCloudSyncEnabled(shouldEnableCloudSync)

    if (!session?.user.id || !supabase) {
      return
    }

    const payload: { user_id: string; plan_code: 'free' | 'pro'; updated_at: string; state?: StoredChatState } = {
      user_id: session.user.id,
      plan_code: plan,
      updated_at: new Date().toISOString(),
    }

    if (plan === 'pro') {
      payload.state = currentStoredState
    }

    const { error } = await supabase
      .from('user_workspace_states')
      .upsert(payload, {
        onConflict: 'user_id',
      })

    if (error) {
      setAuthError(error.message)
      return
    }

    if (plan === 'pro') {
      setLastCloudSyncAt(Date.now())
    }
  }

  return {
    theme,
    setTheme,
    language,
    setLanguage,
    switchLanguage,
    responseMode,
    setResponseMode,
    isNewConversationModalOpen,
    setIsNewConversationModalOpen,
    newConversationMode,
    setNewConversationMode,
    newConversationExamProfile,
    setNewConversationExamProfile,
    newConversationExamFlow,
    setNewConversationExamFlow,
    newConversationTopic,
    setNewConversationTopic,
    newConversationDifficulty,
    setNewConversationDifficulty,
    isMobileConversationMenuOpen,
    setIsMobileConversationMenuOpen,
    isDesktopSidebarPinned,
    setIsDesktopSidebarPinned,
    isDesktopSidebarHovered,
    setIsDesktopSidebarHovered,
    isDesktopSidebarOpen,
    draft,
    setDraft,
    conversations,
    activeConversationId,
    setActiveConversationId,
    deleteConversation,
    isLoading,
    session,
    userPlan,
    setUserPlan,
    setPlanWithCloudSync,
    isCloudSyncEnabled,
    setIsCloudSyncEnabled,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOutFromCloud,
    authError,
    isAuthBusy,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    nowMs,
    draftTextareaRef,
    t,
    conversationList,
    activeConversation,
    visibleMessages,
    hasPendingExamMessage,
    showStickyPassagePanel,
    cloudSyncTimeText,
    resizeDraftTextarea,
    openNewConversationModal,
    closeNewConversationModal,
    submitMessage,
    retryAssistantMessage,
    generateExamQuestion,
    startNewConversation,
    selectQuizOption,
    selectTrueFalseOption,
    handleSubmit,
    isSupabaseConfigured,
  }
}
