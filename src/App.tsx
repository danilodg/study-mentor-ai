import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  MoonStar,
  SunMedium,
} from 'lucide-react'
import { AuthScreen } from './components/AuthScreen'
import { ChatWorkspace } from './components/ChatWorkspace'
import { LandingScreen } from './components/LandingScreen'
import { NewConversationModal } from './components/NewConversationModal'
import { ProfileScreen } from './components/ProfileScreen'
import { isSupabaseConfigured, useAuth } from './context/AuthContext'
import { useChatDerived } from './hooks/useChatDerived'
import { useCloudSync } from './hooks/useCloudSync'
import type {
  AssistantReplyPayload,
  Conversation,
  CopyBlock,
  DifficultyLevel,
  ExamFlow,
  ExamProfile,
  ForcedResponseMode,
  Language,
  Message,
  QuizOptionId,
  ResponseMode,
  Screen,
  StoredChatState,
  Theme,
  ConversationMode,
} from './types/chat'
import {
  createConversation,
  getConversationTitle,
  getQuestionOnlyHistory,
  getStoredChatState,
  parseAssistantReply,
  parseRetryDelayMs,
} from './utils/chat'
import { markdownComponents, markdownInlineComponents } from './utils/markdown'
type ThemeVariables = CSSProperties & {
  '--page-bg': string
  '--page-gradient': string
  '--page-radial': string
  '--grid-color': string
  '--glow-left': string
  '--glow-right': string
  '--glow-bottom-left': string
  '--glow-bottom-right': string
  '--text-main': string
  '--text-soft': string
  '--text-muted': string
  '--panel-border': string
  '--panel-bg': string
  '--panel-shadow': string
  '--card-border': string
  '--card-bg': string
  '--card-shadow': string
  '--input-bg': string
  '--input-border': string
  '--accent-soft': string
  '--accent-line': string
  '--accent-start': string
  '--accent-mid': string
  '--accent-end': string
  '--accent-shadow': string
}

interface GeminiPart {
  text?: string
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[]
  }
}

interface GeminiResponse {
  candidates?: GeminiCandidate[]
}

interface GeminiErrorResponse {
  error?: {
    message?: string
  }
}


const themes: Record<Theme, ThemeVariables> = {
  dark: {
    '--page-bg': '#050916',
    '--page-gradient': 'linear-gradient(180deg,#040716 0%,#071028 45%,#060917 100%)',
    '--page-radial': 'rgba(37,60,148,0.45)',
    '--grid-color': 'rgba(112,151,255,0.07)',
    '--glow-left': 'rgba(72,205,255,0.42)',
    '--glow-right': 'rgba(138,92,255,0.34)',
    '--glow-bottom-left': 'rgba(55,119,255,0.25)',
    '--glow-bottom-right': 'rgba(57,176,255,0.18)',
    '--text-main': '#f8fbff',
    '--text-soft': '#c5d0ef',
    '--text-muted': '#94a3c7',
    '--panel-border': 'rgba(255,255,255,0.1)',
    '--panel-bg': 'linear-gradient(180deg,rgba(18,29,76,0.76),rgba(8,14,37,0.62))',
    '--panel-shadow': 'inset 0 1px 0 rgba(255,255,255,0.08),0 28px 80px rgba(2,6,20,0.45),0 0 0 1px rgba(59,87,180,0.12)',
    '--card-border': 'rgba(127,160,255,0.24)',
    '--card-bg': 'linear-gradient(180deg,rgba(29,45,108,0.28),rgba(8,14,37,0.16))',
    '--card-shadow': 'inset 0 1px 0 rgba(255,255,255,0.12),0 18px 60px rgba(7,12,32,0.38)',
    '--input-bg': 'rgba(9,16,43,0.52)',
    '--input-border': 'rgba(255,255,255,0.1)',
    '--accent-soft': '#9be8ff',
    '--accent-line': '#7ee7ff',
    '--accent-start': '#6fe0ff',
    '--accent-mid': '#687eff',
    '--accent-end': '#8b66ff',
    '--accent-shadow': 'rgba(72,133,255,0.35)',
  },
  light: {
    '--page-bg': '#edf4ff',
    '--page-gradient': 'linear-gradient(180deg,#f9fbff 0%,#edf4ff 42%,#e4eeff 100%)',
    '--page-radial': 'rgba(87,151,255,0.22)',
    '--grid-color': 'rgba(74,113,205,0.08)',
    '--glow-left': 'rgba(98,201,255,0.24)',
    '--glow-right': 'rgba(131,118,255,0.18)',
    '--glow-bottom-left': 'rgba(88,137,255,0.16)',
    '--glow-bottom-right': 'rgba(56,177,255,0.14)',
    '--text-main': '#13203f',
    '--text-soft': '#42557d',
    '--text-muted': '#607297',
    '--panel-border': 'rgba(130,155,222,0.22)',
    '--panel-bg': 'linear-gradient(180deg,rgba(255,255,255,0.82),rgba(232,240,255,0.74))',
    '--panel-shadow': 'inset 0 1px 0 rgba(255,255,255,0.8),0 24px 70px rgba(84,113,173,0.14),0 0 0 1px rgba(132,161,226,0.1)',
    '--card-border': 'rgba(126,156,226,0.26)',
    '--card-bg': 'linear-gradient(180deg,rgba(255,255,255,0.62),rgba(232,240,255,0.42))',
    '--card-shadow': 'inset 0 1px 0 rgba(255,255,255,0.95),0 16px 40px rgba(90,118,170,0.14),0 0 24px rgba(133,188,255,0.14)',
    '--input-bg': 'rgba(255,255,255,0.84)',
    '--input-border': 'rgba(126,156,226,0.2)',
    '--accent-soft': '#1b78d4',
    '--accent-line': '#49a6ff',
    '--accent-start': '#38bdf8',
    '--accent-mid': '#4f7cff',
    '--accent-end': '#7c69ff',
    '--accent-shadow': 'rgba(88,137,255,0.24)',
  },
}

const copy: Record<Language, CopyBlock> = {
  pt: {
    brandLabel: 'Chat educacional com IA',
    heroTitle: 'Aprender com IA, pesquisar melhor e transformar conversa em tarefas reais.',
    heroDescription:
      'Uma interface com cara de produto premium para explicar assuntos, guiar estudo e abrir trilhas de pesquisa sem parecer landing generica.',
    primaryCta: 'Iniciar mentoria',
    secondaryCta: 'Gerar pesquisa',
    featuredLabel: 'Preview shell',
    featuredTitle: 'Chat, tarefas e pesquisa na mesma linguagem premium do sistema.',
    featuredItems: ['Glassmorphism equilibrado', 'Grid tecnico no fundo', 'CTA com gradiente da marca'],
    metricItems: [
      { value: '12+', label: 'formatos de ajuda para estudar e pesquisar' },
      { value: '3 blocos', label: 'explicacao, exemplo e tarefas praticas' },
      { value: '1 fluxo', label: 'chat, trilha de estudo e pesquisa conectados' },
    ],
    workspaceTitle: 'Workspace didatico',
    workspaceDescription: 'Explicacao progressiva, exemplos simples, tarefas de pesquisa e proximos passos no mesmo fluxo.',
    researchTitle: 'Tarefas de pesquisa',
    progressTitle: 'Como a IA responde',
    previewAssistantText: 'Posso explicar um tema, montar um plano de estudo e transformar a conversa em tarefas praticas.',
    previewUserText: 'Quero aprender IA sem me perder em termos tecnicos.',
    inputLabel: 'Pergunte algo, peça um plano ou gere uma tarefa',
    inputPlaceholder: 'Ex.: explique machine learning para iniciante e monte 4 tarefas praticas',
    send: 'Enviar',
    newChat: 'Nova conversa',
    theme: 'Tema',
    language: 'Idioma',
    chatBadge: 'Modo tutoria + pesquisa',
    insightTitle: 'Resposta em camadas',
    insightList: ['explicacao simples', 'exemplo aplicado', 'pergunta de fixacao'],
    researchList: ['conceitos base', 'fontes para pesquisar', 'micro tarefas praticas'],
    quickPrompts: [
      'Explique IA generativa com exemplos simples',
      'Crie 5 tarefas de pesquisa sobre machine learning',
      'Monte um plano de estudo de 7 dias sobre prompts',
    ],
    tasks: [
      {
        title: 'Entender o que e IA',
        description: 'Definir com linguagem simples e listar 3 exemplos do dia a dia.',
        status: 'done',
      },
      {
        title: 'Pesquisar machine learning',
        description: 'Comparar aprendizado supervisionado, nao supervisionado e por reforco.',
        status: 'active',
      },
      {
        title: 'Criar perguntas melhores',
        description: 'Escrever 3 prompts com objetivo, contexto e formato esperado.',
        status: 'next',
      },
    ],
    initialMessages: [],
    responses: {
      default:
        'Posso responder isso como aula curta, mapa mental ou plano de pesquisa. Se quiser, tambem separo em tarefas praticas para estudar depois.',
      ai: 'IA e um conjunto de tecnicas usadas para reconhecer padroes, gerar respostas e apoiar decisoes. O jeito mais facil de aprender e ligar conceito, exemplo real e limite da tecnologia.',
      research:
        'Sugestao de pesquisa: 1) defina o conceito com palavras simples, 2) ache 2 exemplos reais, 3) compare vantagens e riscos, 4) escreva um resumo curto com o que voce entendeu.',
      task:
        'Vou quebrar em tarefas: entender a definicao, buscar fontes confiaveis, comparar exemplos práticos e fechar com uma explicacao feita por voce em linguagem simples.',
      prompt:
        'Um prompt melhor para estudo traz objetivo, nivel e formato. Exemplo: explique redes neurais para iniciante em 3 passos, com 2 exemplos e 1 exercicio final.',
    },
  },
  en: {
    brandLabel: 'Educational AI chat',
    heroTitle: 'Learn with AI, research faster, and turn conversation into real study tasks.',
    heroDescription:
      'A premium product-like interface for explanations, guided study, and research planning without falling into generic landing page patterns.',
    primaryCta: 'Start mentoring',
    secondaryCta: 'Build research plan',
    featuredLabel: 'Preview shell',
    featuredTitle: 'Chat, tasks, and research in the same premium system language.',
    featuredItems: ['Balanced glassmorphism', 'Technical background grid', 'Brand gradient CTA'],
    metricItems: [
      { value: '12+', label: 'study and research support formats' },
      { value: '3 layers', label: 'explanation, example, and practical tasks' },
      { value: '1 flow', label: 'chat, study track, and research connected' },
    ],
    workspaceTitle: 'Learning workspace',
    workspaceDescription: 'Progressive explanations, simple examples, research tasks, and next steps in one flow.',
    researchTitle: 'Research tasks',
    progressTitle: 'How the AI responds',
    previewAssistantText: 'I can explain a topic, build a study plan, and turn the conversation into practical tasks.',
    previewUserText: 'I want to learn AI without getting lost in technical jargon.',
    inputLabel: 'Ask a question, request a plan, or generate tasks',
    inputPlaceholder: 'Example: explain machine learning for beginners and create 4 practice tasks',
    send: 'Send',
    newChat: 'New chat',
    theme: 'Theme',
    language: 'Language',
    chatBadge: 'Tutoring + research mode',
    insightTitle: 'Layered answer',
    insightList: ['simple explanation', 'applied example', 'retention question'],
    researchList: ['core concepts', 'recommended sources', 'practical micro tasks'],
    quickPrompts: [
      'Explain generative AI with simple examples',
      'Create 5 research tasks about machine learning',
      'Build a 7-day study plan for better prompts',
    ],
    tasks: [
      {
        title: 'Understand what AI is',
        description: 'Define it in simple language and list 3 everyday examples.',
        status: 'done',
      },
      {
        title: 'Research machine learning',
        description: 'Compare supervised, unsupervised, and reinforcement learning.',
        status: 'active',
      },
      {
        title: 'Write stronger prompts',
        description: 'Create 3 prompts with goal, context, and expected format.',
        status: 'next',
      },
    ],
    initialMessages: [],
    responses: {
      default:
        'I can answer that as a mini lesson, a study map, or a research plan. I can also break it into practical tasks for later study.',
      ai: 'AI is a set of techniques used to detect patterns, generate responses, and support decisions. The easiest way to learn it is to connect concept, real example, and limitation.',
      research:
        'Research track: 1) define the concept in simple words, 2) find 2 real examples, 3) compare benefits and risks, 4) write a short summary in your own words.',
      task:
        'I would break this into tasks: understand the definition, gather trusted sources, compare practical examples, and finish with your own plain-language explanation.',
      prompt:
        'A better study prompt includes goal, level, and response format. Example: explain neural networks for a beginner in 3 steps, with 2 examples and 1 final exercise.',
    },
  },
}

const googleAiApiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY?.trim()
const chatStorageKey = 'study-mentor-ai-chat'
const cloudSyncDebounceMs = 1300
const googleAiApiUrl = googleAiApiKey
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleAiApiKey}`
  : ''

const systemInstructionByLanguage: Record<Language, string> = {
  pt: [
    'Voce e o Study Mentor AI, um tutor educacional claro e pratico.',
    'Responda sempre em portugues do Brasil.',
    'Explique com linguagem simples, sem soar robotico.',
    'Quando fizer sentido, organize a resposta em: explicacao, exemplo e proximo passo.',
    'Mantenha foco em aprendizagem, pesquisa e tarefas praticas.',
    'Use markdown simples e limpo para formatar melhor a resposta.',
    'Pode usar negrito, listas e subtitulos curtos quando isso ajudar a leitura.',
    'Nao use tabelas e nao exagere na formatacao.',
    'Nao se apresente, nao diga seu nome e nao comece com saudacoes padrao, a menos que o usuario peca isso.',
    'Nao use separadores com --- nem titulos decorados.',
    'Responda sempre em JSON valido.',
    'Tipos aceitos: text, quiz_mcq, true_false e short_answer.',
    'Para text, use: {"type":"text","text":"..."}.',
    'Para quiz_mcq, use: {"type":"quiz_mcq","id":"...","topic":"...","question":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"correctOptionId":"A|B|C|D","explanation":"..."}.',
    'Para true_false, use: {"type":"true_false","id":"...","topic":"...","statement":"...","correctAnswer":true|false,"explanation":"..."}.',
    'Para short_answer, use: {"type":"short_answer","id":"...","topic":"...","question":"...","sampleAnswer":"...","evaluationCriteria":["...","...","..."]}.',
    'Quando o usuario pedir atividade, questao ou multipla escolha, retorne quiz_mcq.',
    'Voce pode usar markdown simples nos campos de texto desses tipos para melhorar leitura.',
  ].join(' '),
  en: [
    'You are Study Mentor AI, a clear and practical educational tutor.',
    'Always answer in English.',
    'Use simple language and avoid robotic phrasing.',
    'When helpful, structure the answer as explanation, example, and next step.',
    'Keep the focus on learning, research, and practical tasks.',
    'Use simple clean markdown to improve readability.',
    'You may use bold text, lists, and short subheadings when helpful.',
    'Do not use tables and do not over-format the answer.',
    'Do not introduce yourself, mention your name, or start with default greetings unless the user asks for it.',
    'Do not use --- separators or decorative headings.',
    'Always return valid JSON.',
    'Allowed types: text, quiz_mcq, true_false, and short_answer.',
    'For text, use: {"type":"text","text":"..."}.',
    'For quiz_mcq, use: {"type":"quiz_mcq","id":"...","topic":"...","question":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"correctOptionId":"A|B|C|D","explanation":"..."}.',
    'For true_false, use: {"type":"true_false","id":"...","topic":"...","statement":"...","correctAnswer":true|false,"explanation":"..."}.',
    'For short_answer, use: {"type":"short_answer","id":"...","topic":"...","question":"...","sampleAnswer":"...","evaluationCriteria":["...","...","..."]}.',
    'When the user asks for an activity, question, or multiple-choice exercise, return quiz_mcq.',
    'You may use simple markdown in text fields to improve readability.',
  ].join(' '),
}

const responseModeOptions: ResponseMode[] = ['auto', 'quiz_mcq', 'true_false', 'short_answer']

const responseModeLabel: Record<Language, Record<ResponseMode, string>> = {
  pt: {
    auto: 'Auto',
    quiz_mcq: 'Multipla escolha',
    true_false: 'Verdadeiro/Falso',
    short_answer: 'Resposta curta',
  },
  en: {
    auto: 'Auto',
    quiz_mcq: 'Multiple choice',
    true_false: 'True/False',
    short_answer: 'Short answer',
  },
}

const conversationModeLabel: Record<Language, Record<ConversationMode, string>> = {
  pt: {
    chat: 'Chat normal',
    exam: 'Modo prova',
  },
  en: {
    chat: 'Normal chat',
    exam: 'Exam mode',
  },
}

const difficultyLabel: Record<Language, Record<DifficultyLevel, string>> = {
  pt: {
    auto: 'Auto',
    easy: 'Facil',
    medium: 'Medio',
    hard: 'Dificil',
  },
  en: {
    auto: 'Auto',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  },
}

const examProfileLabel: Record<Language, Record<ExamProfile, string>> = {
  pt: {
    general: 'Prova geral',
    enem: 'ENEM',
  },
  en: {
    general: 'General exam',
    enem: 'ENEM style',
  },
}

const examFlowLabel: Record<Language, Record<ExamFlow, string>> = {
  pt: {
    single: 'Questoes avulsas',
    passage: 'Texto + 4 questoes',
  },
  en: {
    single: 'Single questions',
    passage: 'Passage + 4 questions',
  },
}

function getResponseModeInstruction(language: Language, mode: ForcedResponseMode) {
  if (mode === 'text') {
    return language === 'pt'
      ? 'Modo de resposta: FORCADO em text. Retorne exatamente esse tipo.'
      : 'Response mode: FORCED to text. Return exactly that type.'
  }

  if (mode === 'auto') {
    return language === 'pt'
      ? 'Modo de resposta: AUTO. Escolha o melhor tipo entre text, quiz_mcq, true_false e short_answer.'
      : 'Response mode: AUTO. Choose the best type among text, quiz_mcq, true_false, and short_answer.'
  }

  return language === 'pt'
    ? `Modo de resposta: FORCADO em ${mode}. Retorne exatamente esse tipo.`
    : `Response mode: FORCED to ${mode}. Return exactly that type.`
}

function App() {
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
  const [screen, setScreen] = useState<Screen>('landing')
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
    isCloudSyncEnabled,
    setIsCloudSyncEnabled,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOutFromCloud,
    authError,
    isAuthBusy,
    setUserPlan,
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
  const themeStyle = useMemo(() => themes[theme], [theme])
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
    ? new Date(lastCloudSyncAt).toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
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
    if (!session) {
      return
    }

    if (screen === 'auth') {
      setScreen('chat')
    }
  }, [screen, session])

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
    if (screen !== 'chat') {
      setIsMobileConversationMenuOpen(false)
      setIsDesktopSidebarPinned(false)
      setIsDesktopSidebarHovered(false)
    }
  }, [screen])

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

  function goToChatWithAuthGate() {
    if (isSupabaseConfigured && !session) {
      setScreen('auth')
      return
    }

    setScreen('chat')
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
        text: language === 'pt'
          ? 'Configure `VITE_GOOGLE_AI_API_KEY` no seu `.env` para ativar as respostas da Google AI. Enquanto isso, sigo com a resposta local do app.'
          : 'Set `VITE_GOOGLE_AI_API_KEY` in your `.env` to enable Google AI responses. Until then, I will keep using the app local reply.',
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
              text: isRateLimitError
                ? (language === 'pt'
                    ? `Limite da API atingido. ${waitSeconds > 0 ? `Tente novamente em ${waitSeconds}s.` : 'Tente novamente em instantes.'}`
                    : `API limit reached. ${waitSeconds > 0 ? `Try again in ${waitSeconds}s.` : 'Please try again shortly.'}`)
                : (language === 'pt'
                    ? 'Nao consegui consultar a IA agora. Tente novamente.'
                    : 'I could not reach AI right now. Please try again.'),
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
              text: isRateLimitError
                ? (language === 'pt'
                    ? `Limite da API atingido. ${waitSeconds > 0 ? `Tente novamente em ${waitSeconds}s.` : 'Tente novamente em instantes.'}`
                    : `API limit reached. ${waitSeconds > 0 ? `Try again in ${waitSeconds}s.` : 'Please try again shortly.'}`)
                : (language === 'pt'
                    ? 'Nao consegui consultar a IA agora. Tente novamente.'
                    : 'I could not reach AI right now. Please try again.'),
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
      const completionText = language === 'pt'
        ? 'Bloco finalizado. Se quiser, posso gerar um novo texto com mais 4 questoes.'
        : 'Set completed. I can generate a new passage with 4 more questions if you want.'

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
    const historyInstruction = recentQuestionHistory.length > 0
      ? (
        language === 'pt'
          ? [
            'Historico de perguntas recentes (somente enunciados):',
            ...recentQuestionHistory.map((question, index) => `${index + 1}. ${question}`),
            'Crie uma NOVA pergunta diferente das anteriores. Nao repita o enunciado nem variacoes superficiais.',
            'Pode reaproveitar o tema geral, mas mude o foco/subtema.',
          ].join(' ')
          : [
            'Recent question history (questions only):',
            ...recentQuestionHistory.map((question, index) => `${index + 1}. ${question}`),
            'Create a NEW question that is different from the previous ones. Do not repeat wording or superficial variations.',
            'You may keep the overall topic, but change the focus/subtopic.',
          ].join(' ')
      )
      : ''

    examGenerationRequestsRef.current.add(requestKey)

    try {
      setIsLoading(true)

      const profileInstruction = targetConversation.examProfile === 'enem'
        ? (language === 'pt'
            ? 'Perfil da prova: ENEM. Priorize contexto, interpretacao e aplicacao pratica.'
            : 'Exam profile: ENEM style. Prioritize context, interpretation, and practical application.')
        : (language === 'pt'
            ? 'Perfil da prova: geral.'
            : 'Exam profile: general.')

      const topicInstruction = targetConversation.topic.trim()
        ? (language === 'pt'
            ? `Assunto preferencial: ${targetConversation.topic.trim()}.`
            : `Preferred topic: ${targetConversation.topic.trim()}.`)
        : (language === 'pt'
            ? 'Assunto: escolha autonomamente um tema recorrente de prova para esta dificuldade.'
            : 'Topic: autonomously choose a common exam topic for this difficulty.')

      let generatedPassageText = forceNewPassage ? '' : targetConversation.examPassage.trim()

      if (targetConversation.examFlow === 'passage' && !generatedPassageText) {
        const passageReply = await getGoogleAiReply(
          language === 'pt'
            ? 'Crie um texto-base curto para prova.'
            : 'Create a short exam reading passage.',
          {
            forcedMode: 'text',
            extraInstruction: language === 'pt'
              ? [
                profileInstruction,
                topicInstruction,
                targetConversation.difficulty === 'auto' ? 'Dificuldade: auto.' : `Dificuldade: ${targetConversation.difficulty}.`,
                'Retorne somente texto no campo text (sem perguntas, sem gabarito).',
                'O texto deve ser claro e ter de 120 a 220 palavras.',
              ].join(' ')
              : [
                profileInstruction,
                topicInstruction,
                targetConversation.difficulty === 'auto' ? 'Difficulty: auto.' : `Difficulty: ${targetConversation.difficulty}.`,
                'Return only passage text in the text field (no questions, no answers).',
                'The passage should be clear and around 120 to 220 words.',
              ].join(' '),
          },
        )

        generatedPassageText = passageReply.text.trim()
      }

      const questionPayload = await getGoogleAiReply(
        targetConversation.examFlow === 'passage' && generatedPassageText
          ? (
            language === 'pt'
              ? `Com base no texto abaixo, gere a questao ${nextQuestionNumber}.\n\nTexto-base:\n${generatedPassageText}`
              : `Based on the text below, generate question ${nextQuestionNumber}.\n\nPassage:\n${generatedPassageText}`
          )
          : (
            language === 'pt'
              ? `Gere a questao ${nextQuestionNumber}.`
              : `Generate question ${nextQuestionNumber}.`
          ),
        {
          forcedMode: 'auto',
          extraInstruction: language === 'pt'
            ? [
              'Contexto de prova: retorne apenas um dos tipos quiz_mcq, true_false ou short_answer.',
              'Nao retorne text neste fluxo de prova.',
              profileInstruction,
              topicInstruction,
              targetConversation.difficulty === 'auto'
                ? 'Dificuldade: auto.'
                : `Dificuldade: ${targetConversation.difficulty}.`,
              targetConversation.examFlow === 'passage'
                ? `Este e um bloco baseado no mesmo texto. Gere a questao ${nextQuestionNumber} de ${maxQuestions || 4} variando habilidade cognitiva.`
                : '',
              historyInstruction,
            ].join(' ')
            : [
              'Exam context: return only quiz_mcq, true_false, or short_answer.',
              'Do not return text in this exam flow.',
              profileInstruction,
              topicInstruction,
              targetConversation.difficulty === 'auto'
                ? 'Difficulty: auto.'
                : `Difficulty: ${targetConversation.difficulty}.`,
              targetConversation.examFlow === 'passage'
                ? `This is a single passage-based set. Generate question ${nextQuestionNumber} of ${maxQuestions || 4} with varied cognitive skills.`
                : '',
              historyInstruction,
            ].join(' '),
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

        const messages = replaceMessageId
          ? conversation.messages.map((message) => (message.id === replaceMessageId ? nextAssistantMessage : message))
          : [...conversation.messages, nextAssistantMessage]

        return {
          ...conversation,
          messages,
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
        const fallbackText = isQuotaError
          ? (language === 'pt'
              ? `Sua cota da API foi atingida. Aguarde ${waitSeconds || 30}s e tente novamente.`
              : `Your API quota has been reached. Wait ${waitSeconds || 30}s and try again.`)
          : (language === 'pt'
              ? 'Nao consegui gerar a proxima questao agora. Tente novamente.'
              : 'I could not generate the next question right now. Please try again.')

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
          messages: [
            ...conversation.messages,
            fallbackMessage,
          ],
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
      setScreen('auth')
      return
    }

    const trimmedTopic = newConversationTopic.trim()
    const shouldUseExamMode = newConversationMode === 'exam'
    const questionTarget = shouldUseExamMode && newConversationExamFlow === 'passage' ? 4 : 0
    const examTitle = trimmedTopic
      || (language === 'pt' ? examProfileLabel.pt[newConversationExamProfile] : examProfileLabel.en[newConversationExamProfile])

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
            text: shouldUseExamMode && newConversationExamFlow === 'passage'
              ? (language === 'pt' ? 'Gerando texto-base e primeira questao...' : 'Generating base passage and first question...')
              : (language === 'pt' ? 'Gerando a primeira questao da prova...' : 'Generating the first exam question...'),
          },
        ],
      }
      : nextConversation

    setConversations((current) => [nextConversationWithInitialMessage, ...current])
    setActiveConversationId(nextConversationWithInitialMessage.id)
    setDraft('')
    setScreen('chat')
    setIsNewConversationModalOpen(false)
    setNewConversationTopic('')
    setNewConversationMode('chat')
    setNewConversationExamProfile('general')
    setNewConversationExamFlow('single')
    setNewConversationDifficulty('auto')

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

    if (activeConversation?.mode === 'exam') {
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

    if (activeConversation?.mode === 'exam') {
      void generateExamQuestion(activeConversation.id, activeConversation.questionCount + 1)
    }
  }

  return (
    <div
      className="min-h-screen overflow-hidden bg-[var(--page-bg)] text-[color:var(--text-soft)] [font-family:Outfit,Segoe_UI,sans-serif] transition-colors duration-300"
      style={themeStyle}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_14%,var(--page-radial),transparent_36%),var(--page-gradient)]" />
      <div className="pointer-events-none fixed inset-0 grid-mask opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_16%,var(--glow-left),transparent_26%)] blur-3xl" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_84%_18%,var(--glow-right),transparent_23%)] blur-3xl" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_26%_84%,var(--glow-bottom-left),transparent_25%)] blur-3xl" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_76%_86%,var(--glow-bottom-right),transparent_24%)] blur-3xl" />

      <div className="pointer-events-none fixed bottom-8 left-6 z-30 hidden lg:block">
        <button
          type="button"
          onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          className="pointer-events-auto group flex h-14 w-14 items-center overflow-hidden rounded-[20px] border border-[color:var(--panel-border)] accent-button text-white transition-[width,transform] duration-300 ease-out hover:w-36 hover:-translate-y-0.5"
          aria-label={t.theme}
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center">
            {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
          </span>
          <span className="min-w-max whitespace-nowrap pr-5 text-sm font-medium uppercase tracking-[0.08em] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {t.theme}
          </span>
        </button>
      </div>

      <div className="fixed bottom-8 right-6 z-30 hidden lg:block">
        <div className="glass-panel inline-flex h-14 items-center gap-2 rounded-[20px] px-3 text-[color:var(--text-main)]">
          <span className="pl-1 font-['IBM_Plex_Mono'] text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            {t.language}
          </span>
          <div className="relative grid grid-cols-2 items-center rounded-[16px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.125rem)] rounded-[12px] bg-[linear-gradient(135deg,var(--accent-start),var(--accent-mid)_55%,var(--accent-end))] shadow-[0_0_18px_var(--accent-shadow)] transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${language === 'pt' ? '0%' : '100%'})` }}
            />
            {(['pt', 'en'] as const).map((option) => {
              const active = language === option

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => switchLanguage(option)}
                  className={[
                    'relative z-10 inline-flex h-8 min-w-11 items-center justify-center rounded-[12px] px-3 font-[IBM_Plex_Mono] text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition',
                    active ? 'text-white' : 'text-[color:var(--text-soft)] hover:text-[color:var(--text-main)]',
                  ].join(' ')}
                >
                  {option.toUpperCase()}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <main className={[
        'relative z-10 mx-auto p-2',
        screen === 'landing' ? 'max-w-[1180px]' : 'max-w-[1880px]',
      ].join(' ')}>
        {screen === 'landing' ? (
          <LandingScreen
            language={language}
            t={t}
            sessionEmail={session?.user.email}
            conversationList={conversationList.map((conversation) => ({ id: conversation.id, title: conversation.title }))}
            onOpenNewConversation={openNewConversationModal}
            onSelectConversation={(conversationId) => {
              setActiveConversationId(conversationId)
              setDraft('')
              goToChatWithAuthGate()
            }}
            onPrimaryAction={goToChatWithAuthGate}
            onSecondaryAction={() => {
              setDraft(t.quickPrompts[1])
              goToChatWithAuthGate()
            }}
            onAccountAction={() => setScreen(session ? 'profile' : 'auth')}
            onQuickPromptAction={(prompt) => {
              void submitMessage(prompt)
              goToChatWithAuthGate()
            }}
          />
        ) : screen === 'auth' ? (
          <AuthScreen
            language={language}
            isSupabaseConfigured={isSupabaseConfigured}
            authEmail={authEmail}
            authPassword={authPassword}
            authError={authError}
            isAuthBusy={isAuthBusy}
            onAuthEmailChange={setAuthEmail}
            onAuthPasswordChange={setAuthPassword}
            onSignInWithGoogle={() => { void signInWithGoogle(language) }}
            onSignInWithEmail={() => { void signInWithEmail(authEmail, authPassword, language) }}
            onSignUpWithEmail={() => { void signUpWithEmail(authEmail, authPassword, language) }}
            onBack={() => setScreen('landing')}
          />
        ) : screen === 'profile' ? (
          <ProfileScreen
            language={language}
            email={session?.user.email}
            userPlan={userPlan}
            isCloudSyncEnabled={isCloudSyncEnabled}
            onToggleCloudSync={() => setIsCloudSyncEnabled((current) => !current)}
            onSignOut={() => { void signOutFromCloud(); setScreen('auth') }}
            onBackToChat={() => setScreen('chat')}
          />
        ) : (
          <ChatWorkspace
            language={language}
            t={t}
            isDesktopSidebarPinned={isDesktopSidebarPinned}
            isDesktopSidebarOpen={isDesktopSidebarOpen}
            setIsDesktopSidebarPinned={setIsDesktopSidebarPinned}
            setIsDesktopSidebarHovered={setIsDesktopSidebarHovered}
            isMobileConversationMenuOpen={isMobileConversationMenuOpen}
            setIsMobileConversationMenuOpen={setIsMobileConversationMenuOpen}
            openNewConversationModal={openNewConversationModal}
            isLoading={isLoading}
            conversationList={conversationList.map((conversation) => ({ id: conversation.id, title: conversation.title }))}
            activeConversationId={activeConversationId}
            setActiveConversationId={setActiveConversationId}
            responseModeOptions={responseModeOptions}
            responseMode={responseMode}
            setResponseMode={setResponseMode}
            responseModeLabel={responseModeLabel}
            setScreen={setScreen}
            sessionEmail={session?.user.email}
            showStickyPassagePanel={showStickyPassagePanel}
            examPassage={activeConversation?.examPassage}
            visibleMessages={visibleMessages}
            selectQuizOption={selectQuizOption}
            selectTrueFalseOption={selectTrueFalseOption}
            retryAssistantMessage={retryAssistantMessage}
            nowMs={nowMs}
            markdownComponents={markdownComponents}
            markdownInlineComponents={markdownInlineComponents}
            activeConversation={activeConversation}
            generateExamQuestion={generateExamQuestion}
            hasPendingExamMessage={hasPendingExamMessage}
            draft={draft}
            setDraft={setDraft}
            resizeDraftTextarea={resizeDraftTextarea}
            draftTextareaRef={draftTextareaRef}
            handleSubmit={handleSubmit}
            userPlan={userPlan}
            isCloudSyncEnabled={isCloudSyncEnabled}
            setIsCloudSyncEnabled={setIsCloudSyncEnabled}
            cloudSyncTimeText={cloudSyncTimeText}
            signOutFromCloud={signOutFromCloud}
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            authPassword={authPassword}
            setAuthPassword={setAuthPassword}
            authError={authError}
            isAuthBusy={isAuthBusy}
            signInWithGoogle={signInWithGoogle}
            signInWithEmail={signInWithEmail}
            signUpWithEmail={signUpWithEmail}
          />
        )}
      </main>

      <NewConversationModal
        language={language}
        isOpen={isNewConversationModalOpen}
        mode={newConversationMode}
        topic={newConversationTopic}
        examProfile={newConversationExamProfile}
        examFlow={newConversationExamFlow}
        difficulty={newConversationDifficulty}
        conversationModeLabel={conversationModeLabel}
        examProfileLabel={examProfileLabel}
        examFlowLabel={examFlowLabel}
        difficultyLabel={difficultyLabel}
        onModeChange={setNewConversationMode}
        onTopicChange={setNewConversationTopic}
        onExamProfileChange={setNewConversationExamProfile}
        onExamFlowChange={setNewConversationExamFlow}
        onDifficultyChange={setNewConversationDifficulty}
        onCancel={closeNewConversationModal}
        onCreate={() => { void startNewConversation() }}
      />

    </div>
  )
}

export default App
