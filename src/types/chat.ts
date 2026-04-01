export type Theme = 'dark' | 'light'
export type Language = 'pt' | 'en'
export type Screen = 'landing' | 'auth' | 'profile' | 'chat'
export type ResponseMode = 'auto' | 'quiz_mcq' | 'true_false' | 'short_answer'
export type ForcedResponseMode = ResponseMode | 'text'
export type ConversationMode = 'chat' | 'exam'
export type DifficultyLevel = 'auto' | 'easy' | 'medium' | 'hard'
export type ExamProfile = 'general' | 'enem'
export type ExamFlow = 'single' | 'passage'

export type QuizOptionId = 'A' | 'B' | 'C' | 'D'

export interface QuizOption {
  id: QuizOptionId
  text: string
}

export interface QuizActivity {
  id: string
  topic: string
  question: string
  options: QuizOption[]
  correctOptionId: QuizOptionId
  explanation: string
}

export interface TrueFalseActivity {
  id: string
  topic: string
  statement: string
  correctAnswer: boolean
  explanation: string
}

export interface ShortAnswerActivity {
  id: string
  topic: string
  question: string
  sampleAnswer: string
  evaluationCriteria: string[]
}

export interface Message {
  id: string
  role: 'assistant' | 'user'
  text: string
  isExamPassage?: boolean
  responseType?: 'text' | 'quiz_mcq' | 'true_false' | 'short_answer'
  quiz?: QuizActivity
  trueFalse?: TrueFalseActivity
  shortAnswer?: ShortAnswerActivity
  selectedOptionId?: QuizOptionId
  selectedTrueFalse?: boolean
  retryAction?: 'chat' | 'exam'
  retrySourceText?: string
  retryQuestionNumber?: number
  retryAt?: number
}

export interface AssistantStructuredResponse {
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

export interface AssistantReplyPayload {
  responseType: 'text' | 'quiz_mcq' | 'true_false' | 'short_answer'
  text: string
  quiz?: QuizActivity
  trueFalse?: TrueFalseActivity
  shortAnswer?: ShortAnswerActivity
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  mode: ConversationMode
  topic: string
  difficulty: DifficultyLevel
  examProfile: ExamProfile
  examFlow: ExamFlow
  examPassage: string
  examQuestionTarget: number
  questionCount: number
  createdAt: number
  updatedAt: number
}

export interface TaskItem {
  title: string
  description: string
  status: 'done' | 'active' | 'next'
}

export interface GeminiPart {
  text?: string
}

export interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[]
  }
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[]
}

export interface GeminiErrorResponse {
  error?: {
    message?: string
  }
}

export interface StoredChatState {
  conversations: Conversation[]
  activeConversationId: string
  language: Language
  responseMode?: ResponseMode
  messages?: Message[]
}

export interface CopyBlock {
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
