import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowUp,
  BookOpenText,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Languages,
  MoonStar,
  Search,
  Sparkles,
  SunMedium,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type Theme = 'dark' | 'light'
type Language = 'pt' | 'en'
type Screen = 'landing' | 'chat'
type ResponseMode = 'auto' | 'quiz_mcq' | 'true_false' | 'short_answer'
type ConversationMode = 'chat' | 'exam'
type DifficultyLevel = 'auto' | 'easy' | 'medium' | 'hard'

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

interface Message {
  id: string
  role: 'assistant' | 'user'
  text: string
  responseType?: 'text' | 'quiz_mcq' | 'true_false' | 'short_answer'
  quiz?: QuizActivity
  trueFalse?: TrueFalseActivity
  shortAnswer?: ShortAnswerActivity
  selectedOptionId?: QuizOptionId
  selectedTrueFalse?: boolean
}

type QuizOptionId = 'A' | 'B' | 'C' | 'D'

interface QuizOption {
  id: QuizOptionId
  text: string
}

interface QuizActivity {
  id: string
  topic: string
  question: string
  options: QuizOption[]
  correctOptionId: QuizOptionId
  explanation: string
}

interface TrueFalseActivity {
  id: string
  topic: string
  statement: string
  correctAnswer: boolean
  explanation: string
}

interface ShortAnswerActivity {
  id: string
  topic: string
  question: string
  sampleAnswer: string
  evaluationCriteria: string[]
}

interface AssistantStructuredResponse {
  type: 'text' | 'quiz_mcq' | 'true_false' | 'short_answer'
  text?: string
  id?: string
  topic?: string
  question?: string
  options?: Array<{ id?: string; text?: string }>
  correctOptionId?: string
  statement?: string
  correctAnswer?: boolean
  sampleAnswer?: string
  evaluationCriteria?: string[]
  explanation?: string
}

interface AssistantReplyPayload {
  responseType: 'text' | 'quiz_mcq' | 'true_false' | 'short_answer'
  text: string
  quiz?: QuizActivity
  trueFalse?: TrueFalseActivity
  shortAnswer?: ShortAnswerActivity
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  mode: ConversationMode
  topic: string
  difficulty: DifficultyLevel
  questionCount: number
  createdAt: number
  updatedAt: number
}

interface TaskItem {
  title: string
  description: string
  status: 'done' | 'active' | 'next'
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

interface StoredChatState {
  conversations: Conversation[]
  activeConversationId: string
  language: Language
  responseMode?: ResponseMode
  messages?: Message[]
}

interface CopyBlock {
  brandLabel: string
  heroTitle: string
  heroDescription: string
  primaryCta: string
  secondaryCta: string
  featuredLabel: string
  featuredTitle: string
  featuredItems: string[]
  metricItems: Array<{ value: string; label: string }>
  workspaceTitle: string
  workspaceDescription: string
  researchTitle: string
  progressTitle: string
  previewAssistantText: string
  previewUserText: string
  inputLabel: string
  inputPlaceholder: string
  send: string
  newChat: string
  theme: string
  language: string
  chatBadge: string
  insightTitle: string
  insightList: string[]
  researchList: string[]
  quickPrompts: string[]
  tasks: TaskItem[]
  initialMessages: Message[]
  responses: {
    default: string
    ai: string
    research: string
    task: string
    prompt: string
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

function getResponseModeInstruction(language: Language, mode: ResponseMode) {
  if (mode === 'auto') {
    return language === 'pt'
      ? 'Modo de resposta: AUTO. Escolha o melhor tipo entre text, quiz_mcq, true_false e short_answer.'
      : 'Response mode: AUTO. Choose the best type among text, quiz_mcq, true_false, and short_answer.'
  }

  return language === 'pt'
    ? `Modo de resposta: FORCADO em ${mode}. Retorne exatamente esse tipo.`
    : `Response mode: FORCED to ${mode}. Return exactly that type.`
}

function cleanAssistantReply(text: string) {
  return text
    .replace(/^---+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeJsonText(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

function parseRetryDelayMs(errorMessage: string) {
  const match = errorMessage.match(/Please retry in\s*([\d.]+)s/i)

  if (!match) {
    return 0
  }

  const seconds = Number.parseFloat(match[1])

  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds * 1000) : 0
}

function parseQuizOptionId(value: string | undefined): QuizOptionId | null {
  if (!value) {
    return null
  }

  const normalized = value.toUpperCase()

  return normalized === 'A' || normalized === 'B' || normalized === 'C' || normalized === 'D'
    ? normalized
    : null
}

function parseAssistantReply(rawText: string): AssistantReplyPayload {
  const normalizedRawText = normalizeJsonText(rawText)

  try {
    const parsed = JSON.parse(normalizedRawText) as AssistantStructuredResponse

    if (parsed.type === 'quiz_mcq') {
      const options = (parsed.options ?? [])
        .map((option) => {
          const optionId = parseQuizOptionId(option.id)

          if (!optionId || !option.text) {
            return null
          }

          return {
            id: optionId,
            text: option.text.trim(),
          } satisfies QuizOption
        })
        .filter(Boolean) as QuizOption[]

      const uniqueOptionIds = new Set(options.map((option) => option.id))
      const correctOptionId = parseQuizOptionId(parsed.correctOptionId)

      if (options.length === 4 && uniqueOptionIds.size === 4 && correctOptionId && parsed.question && parsed.explanation) {
        return {
          responseType: 'quiz_mcq',
          text: '',
          quiz: {
            id: parsed.id?.trim() || `q-${Date.now()}`,
            topic: parsed.topic?.trim() || '',
            question: parsed.question.trim(),
            options,
            correctOptionId,
            explanation: parsed.explanation.trim(),
          },
        }
      }
    }

    if (parsed.type === 'true_false' && parsed.statement && typeof parsed.correctAnswer === 'boolean' && parsed.explanation) {
      return {
        responseType: 'true_false',
        text: '',
        trueFalse: {
          id: parsed.id?.trim() || `tf-${Date.now()}`,
          topic: parsed.topic?.trim() || '',
          statement: parsed.statement.trim(),
          correctAnswer: parsed.correctAnswer,
          explanation: parsed.explanation.trim(),
        },
      }
    }

    if (parsed.type === 'short_answer' && parsed.question && parsed.sampleAnswer) {
      const criteria = (parsed.evaluationCriteria ?? []).filter(Boolean)

      return {
        responseType: 'short_answer',
        text: '',
        shortAnswer: {
          id: parsed.id?.trim() || `sa-${Date.now()}`,
          topic: parsed.topic?.trim() || '',
          question: parsed.question.trim(),
          sampleAnswer: parsed.sampleAnswer.trim(),
          evaluationCriteria: criteria,
        },
      }
    }

    if (parsed.type === 'text' && typeof parsed.text === 'string' && parsed.text.trim()) {
      return {
        responseType: 'text',
        text: cleanAssistantReply(parsed.text),
      }
    }
  } catch {
    return {
      responseType: 'text',
      text: cleanAssistantReply(rawText),
    }
  }

  return {
    responseType: 'text',
    text: cleanAssistantReply(rawText),
  }
}

function createConversation(overrides?: Partial<Pick<Conversation, 'mode' | 'topic' | 'difficulty' | 'title'>>) {
  const now = Date.now()

  return {
    id: `c-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: overrides?.title ?? '',
    messages: [],
    mode: overrides?.mode ?? 'chat',
    topic: overrides?.topic ?? '',
    difficulty: overrides?.difficulty ?? 'auto',
    questionCount: 0,
    createdAt: now,
    updatedAt: now,
  } satisfies Conversation
}

function getStoredChatState() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawState = window.localStorage.getItem(chatStorageKey)

  if (!rawState) {
    return null
  }

  const parseStoredResponseMode = (value: unknown): ResponseMode => (
    value === 'quiz_mcq' || value === 'true_false' || value === 'short_answer' || value === 'auto'
      ? value
      : 'auto'
  )

  try {
    const parsed = JSON.parse(rawState) as StoredChatState

    if (Array.isArray(parsed.conversations) && parsed.conversations.length > 0) {
      const normalizedConversations: Conversation[] = parsed.conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages,
        mode: conversation.mode === 'exam' ? 'exam' : 'chat',
        topic: typeof conversation.topic === 'string' ? conversation.topic : '',
        difficulty: conversation.difficulty === 'easy' || conversation.difficulty === 'medium' || conversation.difficulty === 'hard' || conversation.difficulty === 'auto'
          ? conversation.difficulty
          : 'auto',
        questionCount: typeof conversation.questionCount === 'number' ? conversation.questionCount : 0,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      }))

      const safeActiveConversationId = normalizedConversations.some((conversation) => conversation.id === parsed.activeConversationId)
        ? parsed.activeConversationId
        : normalizedConversations[0].id

      return {
        conversations: normalizedConversations,
        activeConversationId: safeActiveConversationId,
        language: parsed.language === 'en' ? 'en' : 'pt',
        responseMode: parseStoredResponseMode(parsed.responseMode),
      } satisfies StoredChatState
    }

    if (Array.isArray(parsed.messages)) {
      const migratedConversation = createConversation()

      return {
        conversations: [{
          ...migratedConversation,
          messages: parsed.messages,
          title: parsed.messages.find((message) => message.role === 'user')?.text ?? '',
          mode: 'chat',
          topic: '',
          difficulty: 'auto',
          questionCount: 0,
        }],
        activeConversationId: migratedConversation.id,
        language: parsed.language === 'en' ? 'en' : 'pt',
        responseMode: 'auto',
      } satisfies StoredChatState
    }

    return null
  } catch {
    return null
  }
}

function getConversationTitle(text: string) {
  const normalized = text.trim().replace(/\s+/g, ' ')

  if (normalized.length <= 48) {
    return normalized
  }

  return `${normalized.slice(0, 48).trim()}...`
}

function App() {
  const storedChatState = getStoredChatState()
  const initialConversations = storedChatState?.conversations?.length
    ? storedChatState.conversations
    : [createConversation()]

  const [theme, setTheme] = useState<Theme>('dark')
  const [language, setLanguage] = useState<Language>(storedChatState?.language ?? 'pt')
  const [responseMode, setResponseMode] = useState<ResponseMode>(storedChatState?.responseMode ?? 'auto')
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false)
  const [newConversationMode, setNewConversationMode] = useState<ConversationMode>('chat')
  const [newConversationTopic, setNewConversationTopic] = useState('')
  const [newConversationDifficulty, setNewConversationDifficulty] = useState<DifficultyLevel>('auto')
  const [screen, setScreen] = useState<Screen>('landing')
  const [draft, setDraft] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<string>(storedChatState?.activeConversationId ?? initialConversations[0].id)
  const [isLoading, setIsLoading] = useState(false)
  const examGenerationRequestsRef = useRef<Set<string>>(new Set())
  const examBlockedUntilRef = useRef<Map<string, number>>(new Map())

  const t = copy[language]
  const themeStyle = useMemo(() => themes[theme], [theme])
  const conversationList = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  )
  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations],
  )
  const messages = activeConversation?.messages ?? []

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      chatStorageKey,
      JSON.stringify({
        conversations,
        activeConversationId,
        language,
        responseMode,
      } satisfies StoredChatState),
    )
  }, [activeConversationId, conversations, language, responseMode])

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
      forcedMode?: ResponseMode
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
              text: [
                getAssistantReply(value),
                language === 'pt'
                  ? 'Nao consegui consultar a Google AI agora.'
                  : 'I could not reach Google AI right now.',
                errorMessage,
              ].filter(Boolean).join('\n\n'),
            },
          ],
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

  async function generateExamQuestion(conversationId: string, nextQuestionNumber: number, replaceMessageId?: string) {
    const blockedUntil = examBlockedUntilRef.current.get(conversationId) ?? 0

    if (Date.now() < blockedUntil) {
      return
    }

    const requestKey = `${conversationId}:${nextQuestionNumber}`

    if (examGenerationRequestsRef.current.has(requestKey)) {
      return
    }

    const targetConversation = conversations.find((conversation) => conversation.id === conversationId)

    if (!targetConversation || !targetConversation.topic.trim()) {
      return
    }

    examGenerationRequestsRef.current.add(requestKey)

    try {
      setIsLoading(true)

      const questionPayload = await getGoogleAiReply(
        language === 'pt'
          ? `Gere a questao ${nextQuestionNumber} sobre ${targetConversation.topic}.`
          : `Generate question ${nextQuestionNumber} about ${targetConversation.topic}.`,
        {
          forcedMode: 'auto',
          extraInstruction: language === 'pt'
            ? [
              'Contexto de prova: retorne apenas um dos tipos quiz_mcq, true_false ou short_answer.',
              'Nao retorne text neste fluxo de prova.',
              targetConversation.difficulty === 'auto'
                ? 'Dificuldade: auto.'
                : `Dificuldade: ${targetConversation.difficulty}.`,
            ].join(' ')
            : [
              'Exam context: return only quiz_mcq, true_false, or short_answer.',
              'Do not return text in this exam flow.',
              targetConversation.difficulty === 'auto'
                ? 'Difficulty: auto.'
                : `Difficulty: ${targetConversation.difficulty}.`,
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
          : [
            ...conversation.messages,
            nextAssistantMessage,
          ]

        return {
          ...conversation,
          messages,
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
    const trimmedTopic = newConversationTopic.trim()
    const shouldUseExamMode = newConversationMode === 'exam' && Boolean(trimmedTopic)

    const pendingQuestionMessageId = `pending-${Date.now()}`

    const nextConversation = createConversation({
      mode: shouldUseExamMode ? 'exam' : 'chat',
      topic: shouldUseExamMode ? trimmedTopic : '',
      difficulty: shouldUseExamMode ? newConversationDifficulty : 'auto',
      title: shouldUseExamMode
        ? getConversationTitle(trimmedTopic)
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
            text: language === 'pt'
              ? 'Gerando a primeira questao da prova...'
              : 'Generating the first exam question...',
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

  const markdownComponents = {
    h1: ({ children }: any) => <h3 className="mt-4 text-base font-semibold text-[color:var(--text-main)] first:mt-0">{children}</h3>,
    h2: ({ children }: any) => <h3 className="mt-4 text-base font-semibold text-[color:var(--text-main)] first:mt-0">{children}</h3>,
    h3: ({ children }: any) => <h4 className="mt-4 text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--accent-soft)] first:mt-0">{children}</h4>,
    p: ({ children }: any) => <p className="mt-2 first:mt-0">{children}</p>,
    ul: ({ children }: any) => <ul className="mt-2 list-disc space-y-1 pl-5">{children}</ul>,
    ol: ({ children }: any) => <ol className="mt-2 list-decimal space-y-1 pl-5">{children}</ol>,
    li: ({ children }: any) => <li>{children}</li>,
    strong: ({ children }: any) => <strong className="font-semibold text-[color:var(--text-main)]">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => <code className="rounded bg-[color:var(--input-bg)] px-1.5 py-0.5 font-['IBM_Plex_Mono'] text-[0.85em] text-[color:var(--text-main)]">{children}</code>,
  }

  const markdownInlineComponents = {
    p: ({ children }: any) => <>{children}</>,
    strong: ({ children }: any) => <strong className="font-semibold text-[color:var(--text-main)]">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => <code className="rounded bg-[color:var(--input-bg)] px-1.5 py-0.5 font-['IBM_Plex_Mono'] text-[0.85em] text-[color:var(--text-main)]">{children}</code>,
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
          <>
            <div className="pointer-events-none fixed left-4 top-24 z-20 hidden w-72 2xl:block">
            <aside className="pointer-events-auto glass-panel max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[28px] p-2 sm:p-3">
              <span className="section-label">{language === 'pt' ? 'Selecione conversa' : 'Select conversation'}</span>
              <h2 className="mt-3 font-['Space_Grotesk'] text-[1.3rem] font-bold tracking-[-0.03em] text-[color:var(--text-main)]">
                {language === 'pt' ? 'Conversas ja existentes' : 'Existing conversations'}
              </h2>

              <button
                type="button"
                onClick={openNewConversationModal}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 text-sm font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent-line)]"
              >
                {t.newChat}
              </button>

              <div className="mt-5 grid gap-3">
                {conversationList.length > 0 ? conversationList.map((conversation, index) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      setActiveConversationId(conversation.id)
                      setDraft('')
                      setScreen('chat')
                    }}
                    className="glass-card rounded-[20px] border border-[color:var(--card-border)] bg-transparent p-2 text-left transition hover:-translate-y-0.5"
                  >
                    <p className="truncate text-sm font-medium text-[color:var(--text-main)]">
                      {conversation.title || `${t.newChat} ${conversationList.length - index}`}
                    </p>
                  </button>
                )) : (
                  <article className="glass-card rounded-[20px] p-2 text-sm leading-6 text-[color:var(--text-muted)]">
                    {language === 'pt'
                      ? 'Ainda nao existem conversas salvas. Inicie uma mentoria para aparecer aqui.'
                      : 'No saved conversations yet. Start mentoring to see them here.'}
                  </article>
                )}
              </div>
            </aside>
            </div>

            <section className="glass-panel rounded-[28px] px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.06fr)_minmax(340px,0.94fr)] lg:items-center">
                <div>
                  <span className="section-label">{t.brandLabel}</span>
                  <h1 className="mt-3 max-w-[11ch] font-['Space_Grotesk'] text-[clamp(2.55rem,7vw,4.85rem)] font-bold leading-[0.96] tracking-[-0.05em] text-[color:var(--text-main)]">
                    {t.heroTitle}
                  </h1>
                  <p className="mt-3 max-w-[38rem] text-base leading-7 text-[color:var(--text-soft)] sm:text-[1.05rem]">
                    {t.heroDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setScreen('chat')
                      }}
                      className="accent-aura accent-button rounded-full px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      {t.primaryCta}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(t.quickPrompts[1])
                        setScreen('chat')
                      }}
                      className="rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 text-sm font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent-line)]"
                    >
                      {t.secondaryCta}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[t.workspaceTitle, t.researchTitle, t.progressTitle].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-[color:var(--card-border)] bg-transparent px-3.5 py-2.5 font-['IBM_Plex_Mono'] text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--text-soft)]"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative hidden min-h-[460px] overflow-visible lg:block">
                  <div className="absolute left-0 top-14 z-20 w-[56%] rounded-[28px] border border-[color:var(--card-border)] bg-[#0d1430] p-2 shadow-[0_18px_60px_rgba(7,12,32,0.38)]">
                    <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)]">
                      {t.featuredLabel}
                    </span>
                    <div className="mt-4 h-24 rounded-[22px] border border-[color:var(--card-border)] bg-[#121b40]" />
                    <div className="mt-4 space-y-2.5">
                      {t.featuredItems.map((item) => (
                        <div key={item} className="rounded-full border border-[color:var(--card-border)] bg-[#121b40] px-3 py-2 text-sm text-[color:var(--text-soft)]">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="absolute right-0 top-0 z-30 w-[68%] rounded-[28px] border border-[color:var(--card-border)] bg-[#111938] p-2 shadow-[0_22px_65px_rgba(7,12,32,0.42)]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)]">
                        {t.chatBadge}
                      </span>
                      <div className="flex gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--accent-line)]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                      </div>
                    </div>
                    <div className="mt-3 rounded-[22px] border border-[color:var(--card-border)] bg-[#16214a] p-2">
                      <p className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Mentor AI</p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">{t.previewAssistantText}</p>
                    </div>
                    <div className="mt-2 rounded-[22px] border border-[color:var(--card-border)] bg-[#1a2858] p-2">
                      <p className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                        {language === 'pt' ? 'Voce' : 'You'}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">{t.previewUserText}</p>
                    </div>
                  </div>

                  <div className="absolute left-[12%] top-60 z-40 w-[64%] rounded-[28px] border border-[color:var(--card-border)] bg-[#0f1736] p-2 shadow-[0_20px_60px_rgba(7,12,32,0.38)]">
                    <h2 className="font-['Space_Grotesk'] text-[1.18rem] font-bold tracking-[-0.03em] text-[color:var(--text-main)]">
                      {t.featuredTitle}
                    </h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {t.metricItems.map((metric) => (
                        <div key={metric.label} className="rounded-[20px] border border-[color:var(--card-border)] bg-[#16214a] p-3.5">
                          <p className="font-['Space_Grotesk'] text-[1.35rem] font-bold tracking-[-0.04em] text-[color:var(--text-main)]">
                            {metric.value}
                          </p>
                          <p className="mt-1.5 text-sm leading-5 text-[color:var(--text-muted)]">{metric.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {t.metricItems.map((metric, index) => (
                <article key={metric.label} className="glass-card rounded-[24px] p-2">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[18px] bg-transparent text-[color:var(--accent-soft)]">
                    {index === 0 ? <BrainCircuit size={18} /> : index === 1 ? <BookOpenText size={18} /> : <ClipboardList size={18} />}
                  </div>
                  <p className="font-['Space_Grotesk'] text-[1.6rem] font-bold tracking-[-0.04em] text-[color:var(--text-main)]">
                    {metric.value}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-[color:var(--text-muted)]">{metric.label}</p>
                </article>
              ))}
            </div>

            <section className="mt-3 glass-panel rounded-[28px] p-2 sm:p-3 lg:p-3">
              <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)] lg:items-start">
                <div>
                  <span className="section-label">{t.progressTitle}</span>
                  <h2 className="mt-3 max-w-[14ch] font-['Space_Grotesk'] text-[clamp(1.9rem,4vw,3rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[color:var(--text-main)]">
                    {language === 'pt' ? 'Uma tela inicial para apresentar o produto antes do chat.' : 'A landing introduces the product before the chat.'}
                  </h2>
                </div>
                <div className="grid gap-3">
                  {t.quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        void submitMessage(prompt)
                        setScreen('chat')
                      }}
                      className="glass-card rounded-[22px] p-2 text-left text-sm leading-6 text-[color:var(--text-soft)] transition hover:-translate-y-0.5 hover:text-[color:var(--text-main)]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="grid gap-2 lg:h-[calc(100vh-2rem)] lg:grid-cols-[minmax(360px,0.62fr)_minmax(0,1.78fr)] lg:overflow-hidden">
          <section className="glass-panel lg:order-2 flex min-h-0 flex-col rounded-[28px] px-2 pb-2 pt-2 sm:px-3 sm:pb-3 sm:pt-3 lg:px-3 lg:pb-3 lg:pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--panel-border)] pb-2">
              <div>
                <span className="section-label">{t.brandLabel}</span>
                <h2 className="mt-3 font-['Space_Grotesk'] text-[1.7rem] font-bold tracking-[-0.04em] text-[color:var(--text-main)]">
                  {t.workspaceTitle}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScreen('landing')}
                   className="inline-flex items-center gap-2 rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 text-sm font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5"
                >
                  <ArrowLeft size={16} />
                  {language === 'pt' ? 'Voltar' : 'Back'}
                </button>
                <div className="hidden rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)] sm:inline-flex">
                  <Sparkles size={14} className="mr-2" />
                  {t.chatBadge}
                </div>
              </div>
            </div>

            <div className="app-scroll mt-4 grid min-h-0 flex-1 gap-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={[
                    'glass-card w-fit rounded-[24px] p-2',
                    message.role === 'user'
                      ? 'ml-auto max-w-[760px] bg-[linear-gradient(180deg,rgba(31,59,138,0.42),rgba(13,24,64,0.24))]'
                      : 'max-w-[820px]',
                  ].join(' ')}
                >
                  <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                    {message.role === 'assistant' ? 'Mentor AI' : language === 'pt' ? 'Voce' : 'You'}
                  </span>
                  {message.role === 'assistant' ? (
                    message.quiz ? (
                      <div className="mt-2 rounded-[18px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
                        {message.quiz.topic ? (
                          <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
                            {message.quiz.topic}
                          </p>
                        ) : null}
                        <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
                          <ReactMarkdown components={markdownComponents}>{message.quiz.question}</ReactMarkdown>
                        </div>
                        <div className="mt-2 grid gap-2">
                          {message.quiz.options.map((option) => {
                            const isSelected = message.selectedOptionId === option.id
                            const isAnswered = Boolean(message.selectedOptionId)
                            const isCorrect = option.id === message.quiz?.correctOptionId

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => selectQuizOption(message.id, option.id)}
                                disabled={isAnswered}
                                className={[
                                  'rounded-[14px] border px-2 py-2 text-left text-sm transition',
                                  isAnswered && isCorrect ? 'border-emerald-400/60 bg-emerald-500/10 text-[color:var(--text-main)]' : '',
                                  isAnswered && isSelected && !isCorrect ? 'border-rose-400/60 bg-rose-500/10 text-[color:var(--text-main)]' : '',
                                  !isAnswered ? 'border-[color:var(--card-border)] bg-transparent hover:-translate-y-0.5' : '',
                                  isAnswered && !isSelected && !isCorrect ? 'border-[color:var(--card-border)] opacity-75' : '',
                                ].join(' ')}
                              >
                                <span className="mr-2 font-['IBM_Plex_Mono'] text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--accent-soft)]">{option.id}</span>
                                <span>
                                  <ReactMarkdown components={markdownInlineComponents}>{option.text}</ReactMarkdown>
                                </span>
                              </button>
                            )
                          })}
                        </div>
                        {message.selectedOptionId ? (
                          <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                            {message.selectedOptionId === message.quiz.correctOptionId
                              ? (language === 'pt' ? 'Correto. ' : 'Correct. ')
                              : (language === 'pt' ? 'Resposta incorreta. ' : 'Incorrect answer. ')}
                            <ReactMarkdown components={markdownInlineComponents}>{message.quiz.explanation}</ReactMarkdown>
                          </div>
                        ) : null}
                      </div>
                    ) : message.trueFalse ? (
                      <div className="mt-2 rounded-[18px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
                        {message.trueFalse.topic ? (
                          <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
                            {message.trueFalse.topic}
                          </p>
                        ) : null}
                        <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
                          <ReactMarkdown components={markdownComponents}>{message.trueFalse.statement}</ReactMarkdown>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {[true, false].map((value) => {
                            const label = value
                              ? (language === 'pt' ? 'Verdadeiro' : 'True')
                              : (language === 'pt' ? 'Falso' : 'False')
                            const isSelected = message.selectedTrueFalse === value
                            const isAnswered = typeof message.selectedTrueFalse === 'boolean'
                            const isCorrect = value === message.trueFalse?.correctAnswer

                            return (
                              <button
                                key={String(value)}
                                type="button"
                                onClick={() => selectTrueFalseOption(message.id, value)}
                                disabled={isAnswered}
                                className={[
                                  'rounded-[14px] border px-2 py-2 text-sm transition',
                                  isAnswered && isCorrect ? 'border-emerald-400/60 bg-emerald-500/10 text-[color:var(--text-main)]' : '',
                                  isAnswered && isSelected && !isCorrect ? 'border-rose-400/60 bg-rose-500/10 text-[color:var(--text-main)]' : '',
                                  !isAnswered ? 'border-[color:var(--card-border)] hover:-translate-y-0.5' : '',
                                ].join(' ')}
                              >
                                {label}
                              </button>
                            )
                          })}
                        </div>
                        {typeof message.selectedTrueFalse === 'boolean' ? (
                          <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                            {message.selectedTrueFalse === message.trueFalse.correctAnswer
                              ? (language === 'pt' ? 'Correto. ' : 'Correct. ')
                              : (language === 'pt' ? 'Resposta incorreta. ' : 'Incorrect answer. ')}
                            <ReactMarkdown components={markdownInlineComponents}>{message.trueFalse.explanation}</ReactMarkdown>
                          </div>
                        ) : null}
                      </div>
                    ) : message.shortAnswer ? (
                      <div className="mt-2 rounded-[18px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
                        {message.shortAnswer.topic ? (
                          <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
                            {message.shortAnswer.topic}
                          </p>
                        ) : null}
                        <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
                          <ReactMarkdown components={markdownComponents}>{message.shortAnswer.question}</ReactMarkdown>
                        </div>
                        <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                          {language === 'pt' ? 'Resposta modelo:' : 'Sample answer:'} {message.shortAnswer.sampleAnswer}
                        </div>
                        {message.shortAnswer.evaluationCriteria.length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[color:var(--text-soft)]">
                            {message.shortAnswer.evaluationCriteria.map((criterion) => (
                              <li key={criterion}>
                                <ReactMarkdown components={markdownInlineComponents}>{criterion}</ReactMarkdown>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {activeConversation?.mode === 'exam' ? (
                          <button
                            type="button"
                            onClick={() => void generateExamQuestion(activeConversation.id, activeConversation.questionCount + 1)}
                            disabled={isLoading}
                            className="mt-2 rounded-full border border-[color:var(--card-border)] px-3 py-2 text-xs text-[color:var(--text-main)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {language === 'pt' ? 'Proxima questao' : 'Next question'}
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm leading-7 text-[color:var(--text-soft)] sm:text-[0.97rem]">
                        <ReactMarkdown components={markdownComponents}>
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[color:var(--text-soft)] sm:text-[0.97rem]">{message.text}</p>
                  )}
                </article>
              ))}

              {isLoading ? (
                <article className="glass-card w-fit max-w-[820px] rounded-[24px] p-2">
                  <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                    Mentor AI
                  </span>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[color:var(--text-soft)] sm:text-[0.97rem]">
                    {language === 'pt' ? 'Pensando na melhor resposta...' : 'Thinking about the best response...'}
                  </p>
                </article>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
              <label className="font-['IBM_Plex_Mono'] text-[0.72rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                {t.inputLabel}
              </label>
              <div className="glass-card rounded-[26px] p-2 sm:p-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={3}
                    disabled={isLoading}
                    placeholder={t.inputPlaceholder}
                    className="min-h-[84px] flex-1 resize-none rounded-[22px] border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-2 py-2 text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-70 focus:border-[color:var(--accent-line)]"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="accent-button inline-flex h-14 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (language === 'pt' ? 'Enviando...' : 'Sending...') : t.send}
                    <ArrowUp size={16} />
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="glass-panel lg:order-1 flex min-h-0 flex-col rounded-[28px] px-2 pb-2 pt-2 sm:px-3 sm:pb-3 sm:pt-3">
            <div className="app-scroll min-h-0 flex-1 overflow-y-auto pr-1">
            <section className="rounded-[24px] border border-[color:var(--card-border)] bg-transparent p-2 sm:p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="section-label">{language === 'pt' ? 'Conversas em andamento' : 'Ongoing conversations'}</span>
                  <h2 className="mt-3 font-['Space_Grotesk'] text-[1.55rem] font-bold tracking-[-0.04em] text-[color:var(--text-main)]">
                    {language === 'pt' ? 'Seu historico recente fica salvo no navegador.' : 'Your recent history stays saved in the browser.'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={openNewConversationModal}
                  disabled={isLoading}
                  className="inline-flex items-center rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 text-xs font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {t.newChat}
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {conversationList.length > 0 ? conversationList.map((conversation, index) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={[
                      'glass-card w-full rounded-[24px] p-2 text-left',
                      conversation.id === activeConversationId ? 'border-[color:var(--accent-line)]/45' : '',
                    ].join(' ')}
                  >
                    <p className="truncate text-sm font-medium text-[color:var(--text-main)]">
                      {conversation.title || `${t.newChat} ${conversationList.length - index}`}
                    </p>
                  </button>
                )) : (
                  <article className="glass-card rounded-[24px] p-2 text-sm leading-6 text-[color:var(--text-muted)]">
                    {language === 'pt'
                      ? 'As mensagens que voce enviar vao aparecer aqui e continuarao salvas no navegador.'
                      : 'The messages you send will appear here and remain saved in your browser.'}
                  </article>
                )}
              </div>
            </section>

            <section className="mt-2 rounded-[24px] border border-[color:var(--card-border)] bg-transparent p-2 sm:p-3">
              <span className="section-label">{language === 'pt' ? 'Tipo de resposta' : 'Response type'}</span>
              <div className="mt-2 grid gap-2">
                {responseModeOptions.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setResponseMode(mode)}
                    className={[
                      'rounded-[14px] border px-2 py-2 text-left text-sm transition hover:-translate-y-0.5',
                      responseMode === mode
                        ? 'border-[color:var(--accent-line)]/55 bg-[color:var(--input-bg)] text-[color:var(--text-main)]'
                        : 'border-[color:var(--card-border)] bg-transparent text-[color:var(--text-soft)]',
                    ].join(' ')}
                  >
                    {responseModeLabel[language][mode]}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-2 rounded-[24px] border border-[color:var(--card-border)] bg-transparent p-2 sm:p-3">
              <span className="section-label">{t.progressTitle}</span>
              <div className="mt-5 grid gap-3">
                {[
                  { icon: BookOpenText, title: t.insightTitle, items: t.insightList },
                  { icon: Search, title: t.researchTitle, items: t.researchList },
                ].map((block) => (
                  <article key={block.title} className="glass-card rounded-[24px] p-2">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[color:var(--input-bg)] text-[color:var(--accent-soft)]">
                        <block.icon size={17} />
                      </div>
                      <h3 className="font-['Space_Grotesk'] text-[1rem] font-bold tracking-[-0.03em] text-[color:var(--text-main)]">
                        {block.title}
                      </h3>
                    </div>
                    <ul className="grid gap-2">
                      {block.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-[color:var(--text-soft)]">
                          <CheckCircle2 size={15} className="text-[color:var(--accent-line)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-2 rounded-[24px] border border-[color:var(--card-border)] bg-transparent p-2 sm:p-3 lg:min-h-0">
              <span className="section-label">Prompt shortcuts</span>
              <div className="mt-5 grid gap-3">
                {t.quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitMessage(prompt)}
                    className="glass-card rounded-[22px] p-2 text-left text-sm leading-6 text-[color:var(--text-soft)] transition hover:-translate-y-0.5 hover:text-[color:var(--text-main)]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-[26px] border border-[color:var(--card-border)] bg-transparent p-2">
                <div className="mb-4 flex items-center gap-3">
                  <div className="accent-aura flex h-11 w-11 items-center justify-center rounded-[18px] accent-button text-white">
                    <Languages size={18} />
                  </div>
                  <div>
                    <p className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)]">
                      {language === 'pt' ? 'Assistente de estudo' : 'Study assistant'}
                    </p>
                    <h3 className="font-['Space_Grotesk'] text-[1.05rem] font-bold tracking-[-0.03em] text-[color:var(--text-main)]">
                      {language === 'pt' ? 'Pesquisa com resposta guiada' : 'Research with guided response'}
                    </h3>
                  </div>
                </div>
                <p className="text-sm leading-6 text-[color:var(--text-muted)]">
                  {language === 'pt'
                    ? 'O fluxo junta explicacao, checklist, sugestao de fontes e tarefas pequenas para voce aprender e pesquisar no mesmo ambiente.'
                    : 'The flow combines explanation, checklist, source suggestions, and small tasks so learning and research happen in the same environment.'}
                </p>
              </div>
            </section>
            </div>

            <div className="mt-4 flex justify-center lg:hidden">
              <div className="glass-card inline-flex items-center gap-2 rounded-full p-1 text-xs text-[color:var(--text-muted)]">
                <span className="px-3 font-['IBM_Plex_Mono'] uppercase tracking-[0.14em]">{t.language}</span>
                <div className="relative grid grid-cols-2 items-center rounded-full border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-1">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.125rem)] rounded-full bg-[linear-gradient(135deg,var(--accent-start),var(--accent-mid)_55%,var(--accent-end))] shadow-[0_0_18px_var(--accent-shadow)] transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(${language === 'pt' ? '0%' : '100%'})` }}
                  />
                  {(['pt', 'en'] as const).map((option) => {
                    const active = language === option

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => switchLanguage(option)}
                        className={active
                          ? 'relative z-10 inline-flex h-8 items-center rounded-full px-3 font-medium text-white'
                          : 'relative z-10 inline-flex h-8 items-center rounded-full px-3 transition hover:text-[color:var(--text-main)]'}
                      >
                        {option.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
        )}
      </main>

      {isNewConversationModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3">
          <div className="glass-panel w-full max-w-xl rounded-[24px] p-3">
            <h2 className="font-['Space_Grotesk'] text-[1.25rem] font-bold text-[color:var(--text-main)]">
              {language === 'pt' ? 'Nova conversa' : 'New conversation'}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              {language === 'pt'
                ? 'Escolha o tipo de conversa. No modo prova, defina assunto e dificuldade.'
                : 'Choose conversation type. In exam mode, define topic and difficulty.'}
            </p>

            <div className="mt-3 grid gap-2">
              <label className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                {language === 'pt' ? 'Tipo de conversa' : 'Conversation type'}
              </label>
              <select
                value={newConversationMode}
                onChange={(event) => setNewConversationMode(event.target.value as ConversationMode)}
                className="rounded-[14px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-main)] outline-none"
              >
                {(['chat', 'exam'] as const).map((mode) => (
                  <option key={mode} value={mode}>{conversationModeLabel[language][mode]}</option>
                ))}
              </select>
            </div>

            <div className="mt-3 grid gap-2">
              <label className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                {language === 'pt' ? 'Assunto da prova (opcional)' : 'Exam topic (optional)'}
              </label>
              <input
                value={newConversationTopic}
                onChange={(event) => setNewConversationTopic(event.target.value)}
                placeholder={language === 'pt' ? 'Ex.: Historia de Portugal' : 'e.g. History of Portugal'}
                className="rounded-[14px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-main)] outline-none"
              />
            </div>

            <div className="mt-3 grid gap-2">
              <label className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                {language === 'pt' ? 'Dificuldade' : 'Difficulty'}
              </label>
              <select
                value={newConversationDifficulty}
                onChange={(event) => setNewConversationDifficulty(event.target.value as DifficultyLevel)}
                disabled={newConversationMode !== 'exam'}
                className="rounded-[14px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-main)] outline-none disabled:opacity-60"
              >
                {(['auto', 'easy', 'medium', 'hard'] as const).map((difficulty) => (
                  <option key={difficulty} value={difficulty}>{difficultyLabel[language][difficulty]}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeNewConversationModal}
                className="rounded-full border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)]"
              >
                {language === 'pt' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => { void startNewConversation() }}
                className="accent-button rounded-full px-3 py-2 text-sm font-semibold text-white"
              >
                {language === 'pt' ? 'Criar conversa' : 'Create conversation'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
