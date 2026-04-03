export type Theme = 'dark' | 'light'
export type Language = 'pt' | 'en'
export type Screen = 'landing' | 'auth' | 'profile' | 'chat'
export type ResponseMode = 'auto' | 'quiz_mcq' | 'true_false' | 'short_answer' | 'ordering' | 'match_pairs' | 'cloze'
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

export interface OrderingActivity {
  id: string
  topic: string
  question: string
  items: string[]
  correctOrder: string[]
  explanation: string
}

export interface MatchPair {
  left: string
  right: string
}

export interface MatchPairsActivity {
  id: string
  topic: string
  prompt: string
  pairs: MatchPair[]
  explanation: string
}

export interface ClozeBlank {
  id: string
  answer: string
}

export interface ClozeActivity {
  id: string
  topic: string
  text: string
  blanks: ClozeBlank[]
  explanation: string
}

export interface Message {
  id: string
  role: 'assistant' | 'user'
  text: string
  isExamPassage?: boolean
  responseType?: 'text' | 'quiz_mcq' | 'true_false' | 'short_answer' | 'ordering' | 'match_pairs' | 'cloze'
  quiz?: QuizActivity
  trueFalse?: TrueFalseActivity
  shortAnswer?: ShortAnswerActivity
  ordering?: OrderingActivity
  matchPairs?: MatchPairsActivity
  cloze?: ClozeActivity
  orderingAnswer?: string[]
  orderingSubmitted?: boolean
  matchPairsAnswer?: Record<string, string>
  matchPairsSubmitted?: boolean
  clozeAnswer?: Record<string, string>
  clozeSubmitted?: boolean
  selectedOptionId?: QuizOptionId
  selectedTrueFalse?: boolean
  retryAction?: 'chat' | 'exam'
  retrySourceText?: string
  retryQuestionNumber?: number
  retryAt?: number
  examPassageSetIndex?: number
}

export interface AssistantStructuredResponse {
  type: 'text' | 'quiz_mcq' | 'true_false' | 'short_answer' | 'ordering' | 'match_pairs' | 'cloze'
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
  items?: string[]
  correctOrder?: string[]
  prompt?: string
  pairs?: Array<{ left?: string; right?: string }>
  blanks?: Array<{ id?: string; answer?: string }>
}

export interface AssistantReplyPayload {
  responseType: 'text' | 'quiz_mcq' | 'true_false' | 'short_answer' | 'ordering' | 'match_pairs' | 'cloze'
  text: string
  quiz?: QuizActivity
  trueFalse?: TrueFalseActivity
  shortAnswer?: ShortAnswerActivity
  ordering?: OrderingActivity
  matchPairs?: MatchPairsActivity
  cloze?: ClozeActivity
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
  examPassageHistory: string[]
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
